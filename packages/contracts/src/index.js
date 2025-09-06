import { z } from "zod"
export const ResponsesRequestSchema = z.object({
  model: z.string(),
  input: z.any(),
})
export const ResponsesErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
})
