import { z } from "zod";

const projectFields = z.object({
  service: z.string().trim().min(1, "Choose a service to continue.").max(120),
});
const scopeFields = z.object({
  title: z.string().trim().min(2, "Add a project title.").max(160),
  description: z.string().trim().min(20, "Describe your project in at least 20 characters.").max(5000),
});
const contactFields = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
});
const privacyFields = z.object({
  privacy: z.literal(true),
});

export const bookingStepSchemas = [projectFields, scopeFields, contactFields, privacyFields] as const;
export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  message: z.string().trim().min(10, "Write at least 10 characters.").max(5000),
});
export const bookingSchema = z.object({
  service: projectFields.shape.service,
  title: scopeFields.shape.title,
  description: scopeFields.shape.description,
  requirements: z.string().trim().max(5000),
  budget: z.string().trim().max(80),
  timeline: z.string().trim().max(80),
  name: contactFields.shape.name,
  email: contactFields.shape.email,
  phone: z.string().trim().max(40),
  contact: z.enum(["Email", "Phone", "WhatsApp"]),
  privacy: privacyFields.shape.privacy,
});
