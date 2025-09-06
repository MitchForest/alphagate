export function computeCost(tokensIn, tokensOut, table) {
  const inputCost = (tokensIn / 1000) * table.inputPer1k
  const outputCost = (tokensOut / 1000) * table.outputPer1k
  return (inputCost + outputCost) * (1 + table.marginBps / 10_000)
}
