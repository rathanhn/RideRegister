"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

// The main schema for the rider registration, now including a UID
const registrationFormSchema = z
  .object({
    uid: z.string().min(1, "User ID is required."), // User ID from Firebase Auth
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

export async function registerRider(values: RegistrationInput) {
  const parsed = registrationFormSchema.safeParse(values);

  if (!parsed.success) {
    console.error("Validation Errors:", parsed.error.flatten());
    return { success: false, message: "Invalid data provided." };
  }

  try {
    const { uid, ...registrationData } = parsed.data;
    const dataToSave = {
      ...registrationData,
      status: "pending" as const,
      createdAt: new Date(),
    };
    // Use the user's UID as the document ID for easy lookup
    await setDoc(doc(db, "registrations", uid), dataToSave);
    console.log("Document written for user ID: ", uid);
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
});

export async function updateRegistrationStatus(values: z.infer<typeof updateStatusSchema>) {
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
    isAdmin: z.boolean().optional(),
});

export async function addReply(values: z.infer<typeof addReplySchema>) {
    const parsed = addReplySchema.safeParse(values);

    if (!parsed.success) {
        return { success: false, message: "Invalid data provided." };
    }

    try {
        const { questionId, ...replyData } = parsed.data;
        const replyCollectionRef = collection(db, "qna", questionId, "replies");
        await addDoc(replyCollectionRef, {
            ...replyData,
            createdAt: serverTimestamp(),
        });
        return { success: true, message: "Reply posted successfully!" };
    } catch (error) {
        console.error("Error adding reply: ", error);
        return { success: false, message: "Could not post your reply. Please try again." };
    }
}
