// Placeholder cost table structures
export type CostTable = {
  provider: string
  model: string
  inputPer1k: number
  outputPer1k: number
  marginBps: number
}

const TOKENS_PER_THOUSAND = 1000
const BASIS_POINTS_DIVISOR = 10_000

export function computeCost(tokensIn: number, tokensOut: number, table: CostTable): number {
  const inputCost = (tokensIn / TOKENS_PER_THOUSAND) * table.inputPer1k
  const outputCost = (tokensOut / TOKENS_PER_THOUSAND) * table.outputPer1k
  return (inputCost + outputCost) * (1 + table.marginBps / BASIS_POINTS_DIVISOR)
}
