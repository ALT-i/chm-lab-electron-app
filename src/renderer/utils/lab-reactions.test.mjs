import test from 'node:test'
import assert from 'node:assert/strict'
import {
  fallbackReactionCalculation,
  formatReactionFeedback,
} from './lab-reactions.ts'

test('fallbackReactionCalculation produces valid fallback result', () => {
  const payload = {
    reactants: [
      { formula: 'HCl', volume: 25, molarity: 0.1 },
      { formula: 'NaOH', volume: 25, molarity: 0.1 },
    ],
    products: ['NaCl', 'H2O'],
    reaction_type: 'neutralization',
  }

  const result = fallbackReactionCalculation(payload)
  assert.equal(result.balanced_equation, 'HCl + NaOH -> NaCl + H2O')
  assert.equal(result.limiting_reagent, 'HCl')
  assert.equal(result.final_ph, 7.0)
  assert.equal(result.total_volume, 50)
  assert.equal(result.yield.length, 2)
})

test('formatReactionFeedback formats summary cleanly', () => {
  const result = {
    balanced_equation: '1 HCl + 1 NaOH -> 1 NaCl + 1 H2O',
    coefficients: {
      reactants: { HCl: 1, NaOH: 1 },
      products: { NaCl: 1, H2O: 1 },
    },
    limiting_reagent: 'NaOH',
    excess_reagents: [],
    yield: [
      { formula: 'NaCl', theoretical_moles: 0.002, mass_g: 0.12 },
      { formula: 'H2O', theoretical_moles: 0.002, mass_g: 0.04 },
    ],
    final_ph: 7.0,
    total_volume: 50,
  }

  const feedback = formatReactionFeedback(result)
  assert.match(feedback, /Reaction: 1 HCl \+ 1 NaOH -> 1 NaCl \+ 1 H2O/)
  assert.match(feedback, /Limiting Reagent: NaOH/)
  assert.match(feedback, /Yield: 0.12g NaCl, 0.04g H2O/)
  assert.match(feedback, /Resulting pH: 7.00/)
})
