"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

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
