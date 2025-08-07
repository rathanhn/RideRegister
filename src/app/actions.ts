
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc, serverTimestamp, updateDoc, getDoc, runTransaction, deleteDoc, query, orderBy, getDocs } from "firebase/firestore";
import type { UserRole } from "./lib/types";
import { auth } from "@/lib/firebase";
import { headers } from "next/headers";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { revalidatePath } from "next/cache";


// Helper to get a user's role
async function getUserRole(uid: string): Promise<UserRole> {
    if (!uid) return 'user';
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) return 'user';
    return userDoc.data()?.role || 'user';
}

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);


// The schema for the ride registration form
// It now includes uid and email which are passed from the client
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
    console.log("[Server Action] createAccountAndRegisterRider invoked.");

    const parsed = registrationFormSchema.safeParse(values);
    if (!parsed.success) {
        console.error("[Server Action] Validation Errors:", parsed.error.flatten());
        return { success: false, message: "Invalid data provided." };
    }

    const { email, password, confirmPassword, ...registrationData } = parsed.data;
    
    // This is the data we want to save, excluding rules and password info
    const { rule1, rule2, rule3, rule4, rule5, rule6, rule7, ...coreData } = registrationData;
        
    const dataToSave: any = {
      ...coreData,
      email: email,
      status: "pending" as const,
      createdAt: serverTimestamp(),
      consent: true,
    };
    
    // Remove any keys with undefined values to prevent Firestore errors
    Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
            delete dataToSave[key];
        }
    });


    try {
        // Step 1: Create Firebase Auth user
        console.log("[Server Action] Attempting to create Auth user...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;
        console.log(`[Server Action] New Auth user created with UID: ${uid}`);

        // Step 2: Create user document in Firestore for the new user
        console.log("[Server Action] Creating user document in Firestore...");
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            email: user.email,
            displayName: registrationData.fullName,
            role: 'user', 
            photoURL: registrationData.photoURL || null,
            createdAt: serverTimestamp(),
        });
        console.log(`[Server Action] User document created for new user UID: ${uid}`);
        
        // Step 3: Create registration document in Firestore
        const registrationRef = doc(db, "registrations", uid);
        await setDoc(registrationRef, { ...dataToSave, uid });
        console.log(`[Server Action] Registration document created for UID: ${uid}`);
        
        revalidatePath('/dashboard');
        return { success: true, message: "Registration successful! Your application is pending review.", uid: uid };

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.warn(`[Server Action] Email ${email} is already in use.`);
            // No new user is created, but we flag it for the client to handle sign-in.
            // The registration data will be created client-side after sign-in.
             Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });
            return { 
                success: true, 
                message: "Account already exists. We've linked this registration to your account. Logging you in...",
                uid: null, // No new UID was created
                existingUser: true,
                dataForExistingUser: dataToSave // Pass the cleaned data back
            };
        }
        
        console.error("[Server Action] CRITICAL ERROR in registration process: ", error);
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
    const adminRole = await getUserRole(values.adminId);
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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
          statusLastUpdatedBy: adminId, // Record which admin made the change
        });
        return { success: true, message: `Registration status updated to ${status}.` };
    } catch (error) {
        console.error("Error updating registration status: ", error);
        return { success: false, message: "Could not update registration status." };
    }
}

// Schema for deleting a registration
const deleteRegistrationSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  adminId: z.string().min(1, "Admin ID is required."),
});

export async function deleteRegistration(values: z.infer<typeof deleteRegistrationSchema>) {
    const adminRole = await getUserRole(values.adminId);
    if (adminRole !== 'superadmin' && adminRole !== 'admin') {
      return { success: false, message: "Permission denied." };
    }

    const parsed = deleteRegistrationSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, message: "Invalid data provided." };
    }

    const { registrationId } = parsed.data;
    
    // Note: Deleting the Firebase Auth user requires Admin SDK,
    // which should be done in a secure backend environment (e.g., Cloud Function).
    // Here, we'll delete the associated Firestore data.
    try {
      await deleteDoc(doc(db, "registrations", registrationId));
      await deleteDoc(doc(db, "users", registrationId));
      // You would typically trigger a function here to delete the auth user.
      return { success: true, message: "Registration and user data have been deleted." };
    } catch (error) {
      console.error("Error deleting registration:", error);
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
    const adminRole = await getUserRole(values.adminId);
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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
        console.error("Error checking in rider: ", error);
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
    const adminRole = await getUserRole(values.adminId);
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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
        console.error("Error marking rider as finished: ", error);
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
        const userDoc = await getDoc(doc(db, "users", values.userId));
        const displayName = userDoc.data()?.displayName;
        await addDoc(collection(db, "qna"), {
            ...parsed.data,
            userName: displayName || values.userName,
            isPinned: false,
            createdAt: serverTimestamp(),
        });
        return { success: true, message: "Question posted successfully!" };
    } catch (error) {
        console.error("Error adding question: ", error);
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
    const userRole = await getUserRole(values.userId);
    const userDoc = await getDoc(doc(db, "users", values.userId));
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
        console.error("Error adding reply: ", error);
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
  const adminRole = await getUserRole(values.adminId);
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
    console.error("Error updating user role:", error);
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
    const adminRole = await getUserRole(values.adminId);
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
      return { success: false, message: "Permission denied." };
    }
    try {
        await deleteDoc(doc(db, "qna", values.questionId));
        return { success: true, message: "Question deleted." };
    } catch (error) {
        console.error("Error deleting question:", error);
        return { success: false, message: "Failed to delete question." };
    }
}

// Action to toggle pin status of a question
export async function togglePinQuestion(values: z.infer<typeof qnaModSchema>) {
    const adminRole = await getUserRole(values.adminId);
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
        return { success: false, message: "Permission denied." };
    }
    try {
        const questionRef = doc(db, "qna", values.questionId);
        const questionSnap = await getDoc(questionRef);
        if (!questionSnap.exists()) {
            return { success: false, message: "Question not found." };
        }
        const currentPinStatus = questionSnap.data().isPinned || false;
        await updateDoc(questionRef, { isPinned: !currentPinStatus });
        return { success: true, message: `Question ${!currentPinStatus ? 'pinned' : 'unpinned'}.` };
    } catch (error) {
        console.error("Error pinning question:", error);
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
    
    // Create user document with access request
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        email: user.email,
        displayName: user.email?.split('@')[0], // Default display name
        role: 'user', // Start as a user
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
    console.error("Error creating account for organizer request:", error);
    return { success: false, message: "Failed to create account or submit your request." };
  }
}


// === ANNOUNCEMENT ACTIONS ===

// Schema for adding an announcement
const addAnnouncementSchema = z.object({
  message: z.string().min(5, "Announcement must be at least 5 characters.").max(280, "Announcement cannot be longer than 280 characters."),
  adminId: z.string().min(1, "Admin ID is required."),
  adminName: z.string().min(1, "Admin name is required."),
  adminRole: z.enum(['superadmin', 'admin', 'viewer', 'user']),
});

export async function addAnnouncement(values: z.infer<typeof addAnnouncementSchema>) {
    if (values.adminRole !== 'admin' && values.adminRole !== 'superadmin') {
      return { success: false, message: "Permission denied." };
    }
    const parsed = addAnnouncementSchema.safeParse(values);
    if (!parsed.success) {
        return { success: false, message: "Invalid data provided." };
    }
    try {
        const userDoc = await getDoc(doc(db, "users", values.adminId));
        const displayName = userDoc.data()?.displayName;
        
        await addDoc(collection(db, "announcements"), {
            ...parsed.data,
            adminName: displayName || values.adminName,
            createdAt: serverTimestamp(),
        });
        return { success: true, message: "Announcement posted successfully!" };
    } catch (error) {
        console.error("Error adding announcement: ", error);
        return { success: false, message: "Could not post announcement." };
    }
}

// Schema for deleting an announcement
const deleteAnnouncementSchema = z.object({
  announcementId: z.string().min(1, "Announcement ID is required."),
  adminId: z.string().min(1, "Admin ID is required."),
});

export async function deleteAnnouncement(values: z.infer<typeof deleteAnnouncementSchema>) {
    const adminRole = await getUserRole(values.adminId);
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
      return { success: false, message: "Permission denied." };
    }
    try {
        await deleteDoc(doc(db, "announcements", values.announcementId));
        return { success: true, message: "Announcement deleted." };
    } catch (error) {
        console.error("Error deleting announcement:", error);
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
        console.error("Error submitting cancellation request: ", error);
        return { success: false, message: "Could not submit your request. Please try again." };
    }
}

// Schema for password reset
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

// Server action to send a password reset link
export async function sendPasswordResetLink(values: z.infer<typeof forgotPasswordSchema>) {
    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
        return { success: false, message: "Invalid email provided." };
    }

    try {
        await sendPasswordResetEmail(auth, parsed.data.email);
        return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
    } catch (error: any) {
        console.error("Error sending password reset email: ", error);
        // We return a generic message to prevent email enumeration attacks
        return { success: true, message: "If an account exists for this email, a password reset link has been sent." };
    }
}

// === CONTENT MANAGEMENT ACTIONS ===

// Schedule Actions
const scheduleSchema = z.object({
  time: z.string().min(1, "Time is required."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  icon: z.string().min(1, "Icon is required."),
});

export async function manageSchedule(values: z.infer<typeof scheduleSchema> & { adminId: string; scheduleId?: string }) {
  const { adminId, scheduleId, ...data } = values;
  const adminRole = await getUserRole(adminId);
  if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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
  const adminRole = await getUserRole(adminId);
  if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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

// Organizer Actions
const organizerSchema = z.object({
  name: z.string().min(3, "Name is required."),
  role: z.string().min(3, "Role is required."),
  imageUrl: z.string().url("A valid photo URL is required."),
  imageHint: z.string().min(2, "Image hint is required"),
  contactNumber: z.string().optional(),
});

export async function manageOrganizer(values: z.infer<typeof organizerSchema> & { adminId: string; organizerId?: string }) {
  const { adminId, organizerId, ...data } = values;
  const adminRole = await getUserRole(adminId);
  if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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
  const adminRole = await getUserRole(adminId);
  if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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

// Promotion Actions
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
  const adminRole = await getUserRole(adminId);
  if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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
  const adminRole = await getUserRole(adminId);
  if (adminRole !== 'admin' && adminRole !== 'superadmin') {
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
