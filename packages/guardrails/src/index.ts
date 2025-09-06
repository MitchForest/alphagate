// Placeholder guardrail client types
export type GuardrailResult = {
  piiRedacted?: boolean
  safetyFlags?: string[]
}

export async function runGuardrails(_input: unknown): Promise<GuardrailResult> {
  // TODO: call Presidio / Llama Guard services
  return { piiRedacted: false, safetyFlags: [] }
}
