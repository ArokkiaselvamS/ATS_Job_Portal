import { z } from "zod";

export const jobSearchSchema = z.object({
  keyword: z.string().min(2, "Enter at least 2 characters"),
  location: z.string().optional(),
});

export type JobSearchValues = z.infer<typeof jobSearchSchema>;