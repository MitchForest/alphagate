import { z } from 'zod'

export const ResponsesRequestSchema = z.object({
  model: z.string(),
  input: z.any(),
})

export type ResponsesRequest = z.infer<typeof ResponsesRequestSchema>

export const ResponsesErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
})

export type ResponsesError = z.infer<typeof ResponsesErrorSchema>

