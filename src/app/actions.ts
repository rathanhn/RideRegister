
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase"; // Using client SDK on server, which is fine for these operations
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { revalidatePath } from "next/cache";
import { doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, collection, serverTimestamp } from "firebase/firestore";


// Helper to get a user's role by directly querying Firestore
async function checkAdminPermissions(adminId: string): Promise<boolean> {
  if (!adminId) {
    return false;
  }
  try {
    const userDocRef = doc(db, 'users', adminId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return false;
    }
    const userRole = userDoc.data()?.role;
    return userRole === 'admin' || userRole === 'superadmin';
  } catch (error) {
    console.error('[AdminCheck] Error checking permissions:', error);
    return false;
  }
}

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);


// The schema for the ride registration form
const registrationFormSchema = z
  .object({
    email: z.string().email("A valid email is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters."),

    // Rider 1
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    age: z.coerce.number().min(18, "You must be at least 18 years old.").max(100),
    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number."),
    whatsappNumber: z.string().optional(),
    photoURL: z.string().url().optional(),
    
    // Rider 2 (for duo)
    fullName2: z.string().optional(),
    age2: z.coerce.number().optional(),
    phoneNumber2: z.string().optional(),
    photoURL2: z.string().url().optional(),
    
    // Individual rule consents
    rule1: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule2: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule3: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule4: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule5: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule6: z.boolean().refine(val => val, { message: "You must agree to this rule." }),
    rule7: z.boolean().refine(val => val, { message: "You must agree to this rule." }),

    registrationType: z.enum(["solo", "duo"], {
      required_error: "You need to select a registration type.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }

    if (data.registrationType === "duo") {
      if (!data.fullName2 || data.fullName2.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Full name must be at least 2 characters.",
          path: ["fullName2"],
        });
      }
      if (!data.age2 || data.age2 < 18) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rider must be at least 18 years old.",
          path: ["age2"],
        });
      }
      if (!data.phoneNumber2 || !phoneRegex.test(data.phoneNumber2)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid phone number.",
          path: ["phoneNumber2"],
        });
      }
    }
  });

type RegistrationInput = z.infer<typeof registrationFormSchema>;

export async function createAccountAndRegisterRider(values: RegistrationInput) {
    const parsed = registrationFormSchema.safeParse(values);
    if (!parsed.success) {
        return { success: false, message: "Invalid data provided." };
    }

    const { email, password, confirmPassword, ...registrationData } = parsed.data;
    
    const { rule1, rule2, rule3, rule4, rule5, rule6, rule7, ...coreData } = registrationData;
        
    const dataToSave: any = {
      ...coreData,
      email: email,
      status: "pending" as const,
      createdAt: serverTimestamp(),
      consent: true,
    };
    
    Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
            delete dataToSave[key];
        }
    });


    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            email: user.email,
            displayName: registrationData.fullName,
            role: 'user', 
            photoURL: registrationData.photoURL || null,
            createdAt: serverTimestamp(),
        });
        
        const registrationRef = doc(db, "registrations", uid);
        await setDoc(registrationRef, { ...dataToSave, uid });
        
        revalidatePath('/dashboard');
        return { success: true, message: "Registration successful! Your application is pending review.", uid: uid };

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
             Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });
            return { 
                success: true, 
                message: "Account already exists. We've linked this registration to your account. Logging you in...",
                uid: null,
                existingUser: true,
                dataForExistingUser: dataToSave
            };
        }
        
        return { success: false, message: error.message || "Could not create your account or registration. Please try again." };
    }
}


// Schema for updating a registration status
const updateStatusSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  status: z.enum(["approved", "rejected", "pending", "cancellation_requested", "cancelled"]),
  adminId: z.string().min(1, "Admin ID is required."),
});

export async function updateRegistrationStatus(values: z.infer<typeof updateStatusSchema>) {
    const isAdmin = await checkAdminPermissions(values.adminId);
    if (!isAdmin) {
      return { success: false, message: "Permission denied." };
    }

    const parsed = updateStatusSchema.safeParse(values);

    if (!parsed.success) {
        return { success: false, message: "Invalid data provided." };
    }

    try {
        const { registrationId, status, adminId } = parsed.data;
        const registrationRef = doc(db, "registrations", registrationId);
        await updateDoc(registrationRef, { 
          status,
          statusLastUpdatedAt: serverTimestamp(),
          statusLastUpdatedBy: adminId,
        });
        return { success: true, message: `Registration status updated to ${status}.` };
    } catch (error) {
        return { success: false, message: "Could not update registration status." };
    }
}

// Schema for deleting a registration
const deleteRegistrationSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  adminId: z.string().min(1, "Admin ID is required."),
});

export async function deleteRegistration(values: z.infer<typeof deleteRegistrationSchema>) {
    const isAdmin = await checkAdminPermissions(values.adminId);
    if (!isAdmin) {
      return { success: false, message: "Permission denied." };
    }

    const parsed = deleteRegistrationSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, message: "Invalid data provided." };
    }

    const { registrationId } = parsed.data;
    
    try {
      await deleteDoc(doc(db, "registrations", registrationId));
      await deleteDoc(doc(db, "users", registrationId));
      // NOTE: Deleting the auth user requires the Admin SDK, which is currently removed.
      // This action will now only delete the database records.
      // await adminAuth.deleteUser(registrationId);
      
      return { success: true, message: "Registration and user data have been deleted." };
    } catch (error) {
      return { success: false, message: "Failed to delete registration data." };
    }
}


// Schema for checking in a rider
const checkInSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  riderNumber: z.coerce.number().min(1).max(2),
  adminId: z.string().min(1, "Admin ID is required."),
});

export async function checkInRider(values: z.infer<typeof checkInSchema>) {
    const isAdmin = await checkAdminPermissions(values.adminId);
    if (!isAdmin) {
      return { success: false, message: "Permission denied." };
    }

    const parsed = checkInSchema.safeParse(values);

    if (!parsed.success) {
        return { success: false, message: "Invalid data provided for check-in." };
    }

    try {
        const { registrationId, riderNumber } = parsed.data;
        const registrationRef = doc(db, "registrations", registrationId);
        
        const fieldToUpdate = riderNumber === 1 ? 'rider1CheckedIn' : 'rider2CheckedIn';

        await updateDoc(registrationRef, { [fieldToUpdate]: true });
        return { success: true, message: `Rider ${riderNumber} checked in successfully.` };
    } catch (error) {
        return { success: false, message: "Could not process check-in." };
    }
}

// Schema for marking a rider as finished
const finishRiderSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  riderNumber: z.coerce.number().min(1).max(2),
  adminId: z.string().min(1, "Admin ID is required."),
});

export async function finishRider(values: z.infer<typeof finishRiderSchema>) {
    const isAdmin = await checkAdminPermissions(values.adminId);
    if (!isAdmin) {
      return { success: false, message: "Permission denied." };
    }

    const parsed = finishRiderSchema.safeParse(values);

    if (!parsed.success) {
        return { success: false, message: "Invalid data provided for finishing." };
    }

    try {
        const { registrationId, riderNumber } = parsed.data;
        const registrationRef = doc(db, "registrations", registrationId);
        
        const fieldToUpdate = riderNumber === 1 ? 'rider1Finished' : 'rider2Finished';

        await updateDoc(registrationRef, { [fieldToUpdate]: true });
        return { success: true, message: `Rider ${riderNumber} marked as finished!` };
    } catch (error) {
        return { success: false, message: "Could not process finish." };
    }
}


// Schema for adding a question
const addQuestionSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters.").max(500, "Question cannot be longer than 500 characters."),
  userId: z.string().min(1, "User ID is required."),
  userName: z.string().min(1, "User name is required."),
  userPhotoURL: z.string().url().optional().nullable(),
});

export async function addQuestion(values: z.infer<typeof addQuestionSchema>) {
    const parsed = addQuestionSchema.safeParse(values);

    if (!parsed.success) {
        return { success: false, message: "Invalid data provided." };
    }
    
    try {
        const userDocRef = doc(db, "users", values.userId);
        const userDocSnap = await getDoc(userDocRef);
        const displayName = userDocSnap.data()?.displayName;
        await addDoc(collection(db, "qna"), {
            ...parsed.data,
            userName: displayName || values.userName,
            isPinned: false,
            createdAt: serverTimestamp(),
        });
        return { success: true, message: "Question posted successfully!" };
    } catch (error) {
        return { success: false, message: "Could not post your question. Please try again." };
    }
}


// Schema for adding a reply
const addReplySchema = z.object({
    questionId: z.string().min(1, "Question ID is required."),
    text: z.string().min(1, "Reply cannot be empty.").max(500, "Reply cannot be longer than 500 characters."),
    userId: z.string().min(1, "User ID is required."),
    userName: z.string().min(1, "User name is required."),
    userPhotoURL: z.string().url().optional().nullable(),
});

export async function addReply(values: z.infer<typeof addReplySchema>) {
    const parsed = addReplySchema.safeParse(values);

    if (!parsed.success) {
        return { success: false, message: "Invalid data provided." };
    }
    const userDocRef = doc(db, 'users', values.userId);
    const userDoc = await getDoc(userDocRef);
    const userRole = userDoc.data()?.role;
    const displayName = userDoc.data()?.displayName;

    try {
        const { questionId, ...replyData } = parsed.data;
        const replyCollectionRef = collection(db, "qna", questionId, "replies");
        await addDoc(replyCollectionRef, {
            ...replyData,
            userName: displayName || values.userName,
            isAdmin: userRole === 'admin' || userRole === 'superadmin',
            createdAt: serverTimestamp(),
        });
        return { success: true, message: "Reply posted successfully!" };
    } catch (error) {
        return { success: false, message: "Could not post your reply. Please try again." };
    }
}

// Schema for updating a user's role
const updateUserRoleSchema = z.object({
  adminId: z.string().min(1, "Performing user ID is required."),
  targetUserId: z.string().min(1, "Target user ID is required."),
  newRole: z.enum(['superadmin', 'admin', 'viewer', 'user']),
});

export async function updateUserRole(values: z.infer<typeof updateUserRoleSchema>) {
  const adminDoc = await getDoc(doc(db, 'users', values.adminId));
  const adminRole = adminDoc.data()?.role;

  if (adminRole !== 'superadmin' && values.newRole === 'superadmin') {
    return { success: false, message: "Only superadmins can assign the superadmin role." };
  }
   if (adminRole !== 'superadmin' && adminRole !== 'admin') {
    return { success: false, message: "Permission denied." };
  }

  const parsed = updateUserRoleSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Invalid data." };
  }
  
  const { targetUserId, newRole } = parsed.data;

  if (values.adminId === targetUserId && newRole !== adminRole) {
    return { success: false, message: "Admins cannot change their own role." };
  }

  try {
    const userRef = doc(db, "users", targetUserId);
    await updateDoc(userRef, { role: newRole });
    return { success: true, message: `User role updated to ${newRole}.`};
  } catch (error) {
    return { success: false, message: "Failed to update user role." };
  }
}

// Schema for QnA moderation
const qnaModSchema = z.object({
  adminId: z.string().min(1, "Admin ID is required."),
  questionId: z.string().min(1, "Question ID is required."),
});

// Action to delete a question
export async function deleteQuestion(values: z.infer<typeof qnaModSchema>) {
    const isAdmin = await checkAdminPermissions(values.adminId);
    if (!isAdmin) {
      return { success: false, message: "Permission denied." };
    }
    try {
        await deleteDoc(doc(db, "qna", values.questionId));
        return { success: true, message: "Question deleted." };
    } catch (error) {
        return { success: false, message: "Failed to delete question." };
    }
}

// Action to toggle pin status of a question
export async function togglePinQuestion(values: z.infer<typeof qnaModSchema>) {
    const isAdmin = await checkAdminPermissions(values.adminId);
    if (!isAdmin) {
        return { success: false, message: "Permission denied." };
    }
    try {
        const questionRef = doc(db, "qna", values.questionId);
        const questionSnap = await getDoc(questionRef);
        if (!questionSnap.exists()) {
            return { success: false, message: "Question not found." };
        }
        const currentPinStatus = questionSnap.data()?.isPinned || false;
        await updateDoc(questionRef, { isPinned: !currentPinStatus });
        return { success: true, message: `Question ${!currentPinStatus ? 'pinned' : 'unpinned'}.` };
    } catch (error) {
        return { success: false, message: "Failed to update pin status." };
    }
}


// Schema for requesting organizer access
const requestOrganizerAccessSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  consent: z.boolean().refine(val => val, { message: "Consent is required."}),
});

export async function createAndRequestOrganizerAccess(values: z.infer<typeof requestOrganizerAccessSchema>) {
  const parsed = requestOrganizerAccessSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Invalid data provided." };
  }

  const { email, password } = parsed.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        email: user.email,
        displayName: user.email?.split('@')[0],
        role: 'user',
        photoURL: null,
        createdAt: serverTimestamp(),
        accessRequest: {
          requestedAt: serverTimestamp(),
          status: 'pending_review',
        }
    });

    return { success: true, message: "Your account has been created and your request has been submitted. An admin will review it shortly.", uid: user.uid };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
        return { 
            success: false, 
            message: "An account with this email already exists. Please log in and request access from your dashboard.",
        };
    }
    return { success: false, message: "Failed to create account or submit your request." };
  }
}


// === ANNOUNCEMENT ACTIONS ===

const addAnnouncementSchema = z.object({
  message: z.string().min(5, "Announcement must be at least 5 characters.").max(280, "Announcement cannot be longer than 280 characters."),
  adminId: z.string().min(1, "Admin ID is required."),
  adminName: z.string().min(1, "Admin name is required."),
});

export async function addAnnouncement(values: z.infer<typeof addAnnouncementSchema>) {
    const isAdmin = await checkAdminPermissions(values.adminId);
    if (!isAdmin) {
      return { success: false, message: "Permission denied." };
    }
    const parsed = addAnnouncementSchema.safeParse(values);
    if (!parsed.success) {
        return { success: false, message: "Invalid data provided." };
    }
    try {
        const userDocSnap = await getDoc(doc(db, "users", values.adminId));
        const userData = userDocSnap.data();
        
        await addDoc(collection(db, "announcements"), {
            ...parsed.data,
            adminName: userData?.displayName || values.adminName,
            adminRole: userData?.role || 'admin',
            createdAt: serverTimestamp(),
        });
        return { success: true, message: "Announcement posted successfully!" };
    } catch (error) {
        return { success: false, message: "Could not post announcement." };
    }
}

const deleteAnnouncementSchema = z.object({
  announcementId: z.string().min(1, "Announcement ID is required."),
  adminId: z.string().min(1, "Admin ID is required."),
});

export async function deleteAnnouncement(values: z.infer<typeof deleteAnnouncementSchema>) {
    const isAdmin = await checkAdminPermissions(values.adminId);
    if (!isAdmin) {
      return { success: false, message: "Permission denied." };
    }
    try {
        await deleteDoc(doc(db, "announcements", values.announcementId));
        return { success: true, message: "Announcement deleted." };
    } catch (error) {
        return { success: false, message: "Failed to delete announcement." };
    }
}

// Schema for ride cancellation
const cancelRegistrationSchema = z.object({
    registrationId: z.string().min(1, "Registration ID is required."),
    reason: z.string().min(10, "Please provide a reason for cancellation.").max(500),
});

export async function cancelRegistration(values: z.infer<typeof cancelRegistrationSchema>) {
    const parsed = cancelRegistrationSchema.safeParse(values);
    if (!parsed.success) {
        return { success: false, message: "Invalid data provided." };
    }
    try {
        const registrationRef = doc(db, "registrations", values.registrationId);
        await updateDoc(registrationRef, {
            status: 'cancellation_requested',
            cancellationReason: values.reason,
        });
        return { success: true, message: "Your cancellation request has been submitted." };
    } catch (error) {
        return { success: false, message: "Could not submit your request. Please try again." };
    }
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function sendPasswordResetLink(values: z.infer<typeof forgotPasswordSchema>) {
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
        return { success: false, message: "Invalid email provided." };
    }

    try {
        await sendPasswordResetEmail(auth, parsed.data.email);
        return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
    } catch (error: any) {
        return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
    }
}

// === CONTENT MANAGEMENT ACTIONS ===

const scheduleSchema = z.object({
  time: z.string().min(1, "Time is required."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  icon: z.string().min(1, "Icon is required."),
});

export async function manageSchedule(values: z.infer<typeof scheduleSchema> & { adminId: string; scheduleId?: string }) {
  const { adminId, scheduleId, ...data } = values;
  const isAdmin = await checkAdminPermissions(adminId);
  if (!isAdmin) {
    return { success: false, message: "Permission denied." };
  }
  const parsed = scheduleSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Invalid data." };

  try {
    if (scheduleId) {
      await updateDoc(doc(db, "schedule", scheduleId), parsed.data);
      revalidatePath('/');
      return { success: true, message: "Schedule item updated." };
    } else {
      await addDoc(collection(db, "schedule"), { ...parsed.data, createdAt: serverTimestamp() });
      revalidatePath('/');
      return { success: true, message: "Schedule item added." };
    }
  } catch (error) {
    return { success: false, message: "Failed to manage schedule item." };
  }
}

export async function deleteScheduleItem(id: string, adminId: string) {
  const isAdmin = await checkAdminPermissions(adminId);
  if (!isAdmin) {
    return { success: false, message: "Permission denied." };
  }
  try {
    await deleteDoc(doc(db, "schedule", id));
    revalidatePath('/');
    return { success: true, message: "Schedule item deleted." };
  } catch (error) {
    return { success: false, message: "Failed to delete schedule item." };
  }
}

const organizerSchema = z.object({
  name: z.string().min(3, "Name is required."),
  role: z.string().min(3, "Role is required."),
  imageUrl: z.string().url("A valid photo URL is required."),
  imageHint: z.string().min(2, "Image hint is required"),
  contactNumber: z.string().optional(),
});

export async function manageOrganizer(values: z.infer<typeof organizerSchema> & { adminId: string; organizerId?: string }) {
  const { adminId, organizerId, ...data } = values;
  const isAdmin = await checkAdminPermissions(adminId);
  if (!isAdmin) {
    return { success: false, message: "Permission denied." };
  }
  const parsed = organizerSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Invalid data." };

  try {
    if (organizerId) {
      await updateDoc(doc(db, "organizers", organizerId), parsed.data);
      revalidatePath('/');
      return { success: true, message: "Organizer updated." };
    } else {
      await addDoc(collection(db, "organizers"), { ...parsed.data, createdAt: serverTimestamp() });
      revalidatePath('/');
      return { success: true, message: "Organizer added." };
    }
  } catch (error) {
    return { success: false, message: "Failed to manage organizer." };
  }
}

export async function deleteOrganizer(id: string, adminId: string) {
  const isAdmin = await checkAdminPermissions(adminId);
  if (!isAdmin) {
    return { success: false, message: "Permission denied." };
  }
  try {
    await deleteDoc(doc(db, "organizers", id));
    revalidatePath('/');
    return { success: true, message: "Organizer deleted." };
  } catch (error) {
    return { success: false, message: "Failed to delete organizer." };
  }
}

const promotionSchema = z.object({
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  validity: z.string().min(3, "Validity is required."),
  imageUrl: z.string().url("A valid photo URL is required."),
  imageHint: z.string().min(2, "Image hint is required"),
  actualPrice: z.coerce.number().optional(),
  offerPrice: z.coerce.number().optional(),
});

export async function managePromotion(values: z.infer<typeof promotionSchema> & { adminId: string; promotionId?: string }) {
  const { adminId, promotionId, ...data } = values;
  const isAdmin = await checkAdminPermissions(adminId);
  if (!isAdmin) {
    return { success: false, message: "Permission denied." };
  }
  const parsed = promotionSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Invalid data." };

  try {
    if (promotionId) {
      await updateDoc(doc(db, "promotions", promotionId), parsed.data);
      revalidatePath('/');
      return { success: true, message: "Promotion updated." };
    } else {
      await addDoc(collection(db, "promotions"), { ...parsed.data, createdAt: serverTimestamp() });
      revalidatePath('/');
      return { success: true, message: "Promotion added." };
    }
  } catch (error) {
    return { success: false, message: "Failed to manage promotion." };
  }
}

export async function deletePromotion(id: string, adminId: string) {
  const isAdmin = await checkAdminPermissions(adminId);
  if (!isAdmin) {
    return { success: false, message: "Permission denied." };
  }
  try {
    await deleteDoc(doc(db, "promotions", id));
    revalidatePath('/');
    return { success: true, message: "Promotion deleted." };
  } catch (error) {
    return { success: false, message: "Failed to delete promotion." };
  }
}

    