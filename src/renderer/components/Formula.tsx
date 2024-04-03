import React from 'react'

const TokenizeFormula = ({ formula }: { formula: string }) => {
  const tokenize = (formula: string) =>
    formula
      .split(/(\d+)/)
      .map((token, idx) => (idx % 2 ? <sub key={idx}>{token}</sub> : token))

  return (
    <div className="text-center">
      <code>{tokenize(formula)}</code>
    </div>
  )
}

export default TokenizeFormula
