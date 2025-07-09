
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc, serverTimestamp, updateDoc, getDoc, runTransaction, deleteDoc, writeBatch } from "firebase/firestore";
import type { UserRole } from "./lib/types";

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

// The main schema for the rider registration, now including a UID
const registrationFormSchema = z
  .object({
    uid: z.string().min(1, "User ID is required."), // User ID from Firebase Auth
    accountType: z.enum(['rider', 'organization']),
    registrationType: z.enum(["solo", "duo"], {
      required_error: "You need to select a registration type.",
    }),
    
    // Rider 1
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    age: z.coerce.number().min(18, "You must be at least 18 years old.").max(100),
    phoneNumber: z.string().regex(phoneRegex, "Invalid phone number."),
    whatsappNumber: z.string().optional(),
    
    // Rider 2 (for duo)
    fullName2: z.string().optional(),
    age2: z.coerce.number().optional(),
    phoneNumber2: z.string().optional(),
    
    consent: z.boolean().refine((val) => val === true, {
      message: "You must agree to the rules.",
    }),
  })
  .superRefine((data, ctx) => {
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

export async function registerRider(values: RegistrationInput & {email?: string;}) {
  const parsed = registrationFormSchema.safeParse(values);

  if (!parsed.success) {
    console.error("Validation Errors:", parsed.error.flatten());
    return { success: false, message: "Invalid data provided." };
  }

  try {
    const { uid, ...registrationData } = parsed.data;

    // Organization members requesting access get 'viewer' role, others get 'user'.
    const role: UserRole = registrationData.accountType === 'organization' ? 'viewer' : 'user';

    // Use a transaction to ensure both documents are created successfully
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", uid);
      const registrationRef = doc(db, "registrations", uid);

      // 1. Create the user document
      transaction.set(userRef, {
        email: values.email,
        displayName: registrationData.fullName,
        role: role,
        createdAt: serverTimestamp(),
      });

      // 2. Create the registration document
       const dataToSave = {
        ...registrationData,
        status: "pending" as const,
        createdAt: serverTimestamp(),
      };
      transaction.set(registrationRef, dataToSave);
    });

    console.log(`Document written for user ID: ${uid} with role: ${role}`);
    return { success: true, message: "Registration successful!" };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, message: "Could not save your registration. Please try again." };
  }
}

// Schema for updating a registration status
const updateStatusSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required."),
  status: z.enum(["approved", "rejected", "pending"]),
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
        const { registrationId, status } = parsed.data;
        const registrationRef = doc(db, "registrations", registrationId);
        await updateDoc(registrationRef, { status });
        return { success: true, message: `Registration status updated to ${status}.` };
    } catch (error) {
        console.error("Error updating registration status: ", error);
        return { success: false, message: "Could not update registration status." };
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
        await addDoc(collection(db, "qna"), {
            ...parsed.data,
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

    try {
        const { questionId, ...replyData } = parsed.data;
        const replyCollectionRef = collection(db, "qna", questionId, "replies");
        await addDoc(replyCollectionRef, {
            ...replyData,
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
  if (adminRole !== 'superadmin') {
    return { success: false, message: "Permission denied: Only superadmins can change roles." };
  }

  const parsed = updateUserRoleSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Invalid data." };
  }
  
  const { targetUserId, newRole } = parsed.data;

  // Prevent a superadmin from demoting themselves
  if (values.adminId === targetUserId && newRole !== 'superadmin') {
    return { success: false, message: "Superadmins cannot demote themselves." };
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
