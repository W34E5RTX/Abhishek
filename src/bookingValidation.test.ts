import { describe, expect, it } from "vitest";
import { bookingSchema, bookingStepSchemas, contactFormSchema } from "./bookingValidation";

const validBooking = {
  service: "Frontend Development",
  title: "Portfolio redesign",
  description: "A responsive portfolio site to present my work and services.",
  requirements: "Project gallery and contact form",
  budget: "Not decided",
  timeline: "Discuss later",
  name: "A User",
  email: "person@example.com",
  phone: "",
  contact: "Email",
  privacy: true,
};

describe("project inquiry validation", () => {
  it("accepts a complete, valid inquiry", () => {
    expect(bookingSchema.safeParse(validBooking).success).toBe(true);
  });

  it("rejects an invalid email before the contact step advances", () => {
    const result = bookingStepSchemas[2].safeParse({ name: "A User", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("requires a meaningful description before the project step advances", () => {
    const result = bookingStepSchemas[1].safeParse({ title: "A site", description: "too short" });
    expect(result.success).toBe(false);
  });

  it("requires privacy consent before submission", () => {
    expect(bookingSchema.safeParse({ ...validBooking, privacy: false }).success).toBe(false);
  });

  it("rejects oversized user-provided text", () => {
    expect(bookingSchema.safeParse({ ...validBooking, description: "x".repeat(5001) }).success).toBe(false);
  });

  it("validates contact messages before submission", () => {
    expect(contactFormSchema.safeParse({ name: "A User", email: "person@example.com", message: "Please tell me more about the service." }).success).toBe(true);
    expect(contactFormSchema.safeParse({ name: "A", email: "not-an-email", message: "short" }).success).toBe(false);
  });
});
