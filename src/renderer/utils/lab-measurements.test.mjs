// Run with: yarn test  (Node's built-in test runner; needs Node >= 22.18 to import .ts directly)
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  LEGACY_MAX_VOLUME,
  LEGACY_RECOMMENDED_VOLUME,
  formatNumber,
  formatSubstanceLabel,
  getCapacity,
  getPourLimits,
  pickContainer,
  toCm3,
} from './lab-measurements.ts'

const beaker250 = { name: '250 mL Beaker', type: 'TOOL', volume: 250 }
const thermometer = { name: 'Thermometer', type: 'TOOL', volume: null }
const hcl = {
  name: 'Hydrochloric Acid',
  type: 'SUBSTANCE',
  volume: 500,
  phValue: 1,
  molarity: 0.1,
}

test('toCm3 converts dm³ and leaves cm³ unchanged', () => {
  assert.equal(toCm3(25, 'cm³'), 25)
  assert.equal(toCm3(0.4, 'dm³'), 400)
})

test('apparatus capacity comes from its volume; substances have none', () => {
  assert.equal(getCapacity(beaker250), 250)
  assert.equal(getCapacity(thermometer), null)
  assert.equal(getCapacity(hcl), null)
})

test('merged items use their explicit capacity, even when typed as SUBSTANCE', () => {
  assert.equal(
    getCapacity({
      name: 'Beaker with HCl',
      type: 'SUBSTANCE',
      volume: 30,
      capacity: 250,
    }),
    250
  )
  assert.equal(
    getCapacity({
      name: 'Mystery mix',
      type: 'TOOL',
      volume: 30,
      capacity: null,
    }),
    null
  )
})

test('pour limit is the space left in the container', () => {
  const limits = getPourLimits({
    name: 'Beaker with HCl',
    capacity: 250,
    contents: 100,
  })
  assert.equal(limits.maxVolume, 150)
  assert.equal(limits.recommendedVolume, null)
})

test('recommended volume comes from the merge rule targetVolume', () => {
  assert.equal(
    getPourLimits(beaker250, { targetVolume: 25 }).recommendedVolume,
    25
  )
})

test('unknown capacity falls back to the legacy 500 / 200 limits', () => {
  const limits = getPourLimits(thermometer)
  assert.equal(limits.maxVolume, LEGACY_MAX_VOLUME)
  assert.equal(limits.recommendedVolume, LEGACY_RECOMMENDED_VOLUME)
})

test('a fresh 250 mL beaker allows up to 250 cm³', () => {
  assert.equal(getPourLimits(beaker250).maxVolume, 250)
})

test('a full container allows nothing more', () => {
  const limits = getPourLimits({
    name: 'Full beaker',
    capacity: 50,
    contents: 50,
  })
  assert.equal(limits.maxVolume, 0)
})

test('pickContainer uses the merge rule apparatus name', () => {
  const merged = {
    name: 'Conical Flask with HCl',
    type: 'SUBSTANCE',
    capacity: 250,
    contents: 25,
  }
  const indicator = { name: 'Phenolphthalein Indicator', type: 'SUBSTANCE' }
  const rule = {
    with: {
      substance: 'Phenolphthalein Indicator',
      apparatus: 'Conical Flask with HCl',
    },
  }
  assert.equal(pickContainer(indicator, merged, rule), merged)
  assert.equal(pickContainer(merged, indicator, rule), merged)
})

test('pickContainer falls back to the non-substance item', () => {
  assert.equal(pickContainer(hcl, beaker250), beaker250)
  assert.equal(pickContainer(beaker250, hcl), beaker250)
})

test('formatNumber keeps up to 2 decimals without trailing zeros', () => {
  assert.equal(formatNumber(7.4), '7.4')
  assert.equal(formatNumber(1), '1')
  assert.equal(formatNumber(12.345), '12.35')
})

test('formatSubstanceLabel shows molarity and pH when known', () => {
  assert.equal(formatSubstanceLabel(hcl), '0.1 M · pH 1')
  assert.equal(formatSubstanceLabel({ phValue: 7.4 }), 'pH 7.4')
  assert.equal(formatSubstanceLabel({ phValue: null, molarity: null }), '')
})
