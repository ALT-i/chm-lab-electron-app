// Run with: yarn test  (Node's built-in test runner; needs Node >= 22.18 to import .ts directly)
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  liquidAppearance,
  fillFraction,
  isGasProduct,
  MIN_VISIBLE_FRACTION,
} from './liquid-appearance.ts'

const vessel = (over) => ({ name: 'Solution', contents: 50, capacity: 250, phValue: 7, ...over })

test('an empty vessel has no liquid to draw', () => {
  assert.equal(liquidAppearance(vessel({ contents: 0 })), null)
  assert.equal(liquidAppearance(vessel({ contents: undefined, volume: 0 })), null)
})

test('methyl orange turns over its published 3.1 - 4.4 range', () => {
  const at = (ph) => liquidAppearance(vessel({ name: 'Methyl Orange in acid', phValue: ph })).label
  assert.equal(at(1.1), 'methyl orange, acidic')
  assert.equal(at(3.0), 'methyl orange, acidic')
  assert.equal(at(3.8), 'methyl orange, end point')
  assert.equal(at(4.5), 'methyl orange, alkaline')
  assert.equal(at(13), 'methyl orange, alkaline')
})

test('phenolphthalein is colourless until about 8.2 and pink past 10', () => {
  const at = (ph) => liquidAppearance(vessel({ name: 'Phenolphthalein', phValue: ph })).label
  assert.equal(at(7), 'phenolphthalein, colourless')
  assert.equal(at(8.1), 'phenolphthalein, colourless')
  assert.equal(at(9), 'phenolphthalein, faint pink')
  assert.equal(at(12), 'phenolphthalein, pink')
})

test('an indicator wins over the solution colour; a coloured salt wins over plain water tint', () => {
  // copper sulphate plus methyl orange: the indicator is what the student added to see
  assert.match(liquidAppearance(vessel({ name: 'Copper Sulphate + Methyl Orange', phValue: 2 })).label, /methyl orange/)
  assert.equal(liquidAppearance(vessel({ name: 'Copper Sulphate' })).label, 'copper(II), blue')
  assert.equal(liquidAppearance(vessel({ name: 'Potassium Permanganate' })).label, 'permanganate, purple')
  assert.equal(liquidAppearance(vessel({ name: 'Diluted Acid Solution', phValue: 1.9 })).label, 'colourless solution')
})

test('bubbles when the reaction produced a gas', () => {
  assert.equal(isGasProduct('CO2'), true)
  assert.equal(isGasProduct('CO2(g)'), true)
  assert.equal(isGasProduct('NaCl'), false)
  const fizz = liquidAppearance(vessel({ name: 'Sodium Carbonate + acid', reactionResult: { products: { CO2: 1, NaCl: 2, H2O: 1 } } }))
  assert.equal(fizz.bubbling, true)
  const typed = liquidAppearance(vessel({ reactionResult: { reaction_type: 'gas_evolution', products: {} } }))
  assert.equal(typed.bubbling, true)
  assert.equal(liquidAppearance(vessel({ reactionResult: { products: { NaCl: 1, H2O: 1 } } })).bubbling, false)
})

test('a small pour in a big vessel is still visible, and the level scales to the brim', () => {
  // 20 cm3 in a 400 cm3 beaker is 5%, a few pixels: floored to the visible minimum
  assert.ok(fillFraction(20, 400) >= MIN_VISIBLE_FRACTION)
  assert.ok(fillFraction(120, 400) > fillFraction(20, 400))
  assert.equal(fillFraction(400, 400), 1)
  assert.equal(fillFraction(0, 400), 0)
  // unknown capacity: show something rather than nothing
  assert.ok(fillFraction(30, 0) > 0)
})
