// Placeholder cost table structures
export type CostTable = {
  provider: string
  model: string
  inputPer1k: number
  outputPer1k: number
  marginBps: number
}

export function computeCost(tokensIn: number, tokensOut: number, table: CostTable): number {
  const inputCost = (tokensIn / 1000) * table.inputPer1k
  const outputCost = (tokensOut / 1000) * table.outputPer1k
  return (inputCost + outputCost) * (1 + table.marginBps / 10000)
}

