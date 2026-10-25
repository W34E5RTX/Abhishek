import { useEffect, useState } from "react";
import { z } from "zod";

const categorySchema = z.object({ name: z.string(), slug: z.string() });

export const publicProjectSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  coverImage: z.string().nullable(),
  category: categorySchema,
  technologies: z.array(z.string()),
  sampleRecord: z.boolean(),
});
export type PublicProject = z.infer<typeof publicProjectSchema>;
export const publicProjectsSchema = z.array(publicProjectSchema);

export const publicServiceSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  deliverables: z.array(z.string()),
  requirements: z.array(z.string()).nullable().optional(),
  complexity: z.string().nullable().optional(),
  startingPrice: z.string().nullable(),
  currency: z.string(),
  serviceCategory: categorySchema,
  sortOrder: z.number(),
});
export type PublicService = z.infer<typeof publicServiceSchema>;
export const publicServicesSchema = z.array(publicServiceSchema);

export const publicProductSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: categorySchema,
  coverImage: z.string().nullable(),
  features: z.unknown().nullable(),
  requirements: z.string().nullable(),
  installation: z.string().nullable(),
  version: z.string().nullable(),
  license: z.string().nullable(),
  price: z.string().nullable(),
  originalPrice: z.string().nullable(),
  currency: z.string(),
  sampleRecord: z.boolean(),
});
export type PublicProduct = z.infer<typeof publicProductSchema>;
export const publicProductsSchema = z.array(publicProductSchema);

export const faqSchema = z.object({ id: z.string(), question: z.string(), answer: z.string() });
export const faqsSchema = z.array(faqSchema);

export function usePublicRecords<T>(url: string, schema: z.ZodType<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(url).then(async (response) => {
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string" ? body.error : "Public content could not be loaded.";
        throw new Error(message);
      }
      return schema.parse(body);
    }).then((records) => { if (active) setItems(records); }).catch((failure: unknown) => {
      if (active) setError(failure instanceof Error ? failure.message : "Public content could not be loaded.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url, schema]);
  return { items, loading, error };
}

export function usePublicRecord<T>(url: string, schema: z.ZodType<T>) {
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(url).then(async (response) => {
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string" ? body.error : "Public content could not be loaded.";
        throw new Error(message);
      }
      return schema.parse(body);
    }).then((record) => { if (active) setItem(record); }).catch((failure: unknown) => {
      if (active) setError(failure instanceof Error ? failure.message : "Public content could not be loaded.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url, schema]);
  return { item, loading, error };
}
