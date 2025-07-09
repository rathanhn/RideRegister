"use server";

import { z } from "zod";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
  fullName: z.string().min(2),
  age: z.coerce.number().min(18).max(100),
  phoneNumber: z.string().regex(phoneRegex),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional(),
  consent: z.boolean().refine((val) => val === true),
});

type RegistrationInput = z.infer<typeof formSchema>;

export async function registerRider(values: RegistrationInput) {
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, message: "Invalid data provided." };
  }

  // Here you would typically store the data in a database like Firebase Firestore or Google Sheets.
  // For this example, we'll just log it and simulate success.
  console.log("New Rider Registration:", parsed.data);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true, message: "Registration successful!" };
}
