// Run with: yarn test  (Node's built-in test runner; needs Node >= 22.18 to import .ts directly)
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  LEGACY_MAX_VOLUME,
  LEGACY_RECOMMENDED_VOLUME,
  formatNumber,
  formatSubstanceLabel,
  formatVolumeCaption,
  getCapacity,
  getMergedCapacity,
  getMergedContents,
  getPourLimits,
  getStepTolerance,
  isLiquidSource,
  parseCapacityFromName,
  pickContainer,
  toCm3,
  getInstrumentPrecision,
  getPrecisionDecimals,
  formatWithPrecision,
  getInstrumentStep,
  applyReadingError,
  evaluatePourTolerance,
} from './lab-measurements.ts'

const beaker250 = { name: '250 mL Beaker', type: 'TOOL', volume: 250 }
const burette50 = { name: '50 mL Burette', type: 'TOOL', volume: 50, precision: 0.05 }
const cylinder10 = { name: '10 mL Measuring Cylinder', type: 'TOOL', volume: 10 }
const cylinder100 = { name: '100 mL Measuring Cylinder', type: 'TOOL', volume: 100 }
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

test('unknown capacity falls back to the legacy max and sets no target of its own', () => {
  const limits = getPourLimits(thermometer)
  assert.equal(limits.maxVolume, LEGACY_MAX_VOLUME)
  assert.equal(limits.recommendedVolume, null)
})

test('a 25 cm³ pipette draw is accepted when the step sets no targetVolume', () => {
  const pipette = { name: '5ml Pippette', type: 'TOOL', volume: null }
  const limits = getPourLimits(pipette, {})
  assert.equal(limits.recommendedVolume, null)
  assert.ok(limits.maxVolume >= 25)
  assert.notEqual(limits.recommendedVolume, LEGACY_RECOMMENDED_VOLUME)
})

test('Exp 5A: a 1000 cm³ targetVolume fits an unknown-capacity container', () => {
  const limits = getPourLimits(thermometer, { targetVolume: 1000 })
  assert.equal(limits.maxVolume, 1000)
  assert.equal(limits.recommendedVolume, 1000)
})

test('Exp 5A: 1000 cm³ fits a flask sized by its name', () => {
  const flask = { name: '1 litre Flask', type: 'TOOL', volume: null }
  assert.equal(getCapacity(flask), 1000)
  assert.equal(getPourLimits(flask).maxVolume, 1000)
})

test("the merge rule's targetVolume always fits, even past a recorded capacity", () => {
  const limits = getPourLimits(beaker250, { targetVolume: 1000 })
  assert.equal(limits.maxVolume, 1000)
  assert.equal(limits.recommendedVolume, 1000)
})

test('capacity is read from the apparatus name when volume is missing', () => {
  assert.equal(parseCapacityFromName('250cm3 Conical Flask'), 250)
  assert.equal(parseCapacityFromName('250 cm³ Conical Flask'), 250)
  assert.equal(parseCapacityFromName('1000 mL Beaker'), 1000)
  assert.equal(parseCapacityFromName('1 litre Flask'), 1000)
  assert.equal(parseCapacityFromName('0.5 dm3 Flask'), 500)
  assert.equal(parseCapacityFromName('Bunsen Burner'), null)
  assert.equal(
    getCapacity({ name: '250cm3 Conical Flask', type: 'TOOL', volume: null }),
    250
  )
})

test('a volume of 0 means capacity is not set, so the legacy fallback applies', () => {
  const dish = { name: 'Evaporating Dish', type: 'TOOL', volume: 0 }
  assert.equal(getCapacity(dish), null)
  assert.equal(getPourLimits(dish).maxVolume, LEGACY_MAX_VOLUME)
  assert.equal(
    getCapacity({ name: '250cm3 Conical Flask', type: 'TOOL', volume: 0 }),
    250
  )
})

test('pipettes are unconstrained so 25 cm³ transfers with the 5ml Pippette work', () => {
  const pipette = { name: '5ml Pippette', type: 'TOOL', volume: null }
  assert.equal(getCapacity(pipette), null)
  assert.equal(getCapacity({ ...pipette, volume: 5 }), null)
  assert.ok(getPourLimits(pipette).maxVolume >= 25)
})

test('merged contents: a pour adds to the container, ignoring its capacity', () => {
  const freshFlask = { name: '250cm3 Conical Flask', type: 'TOOL', volume: 250 }
  assert.equal(getMergedContents(freshFlask, hcl, 25), 25)

  const flaskWith10 = { name: 'Oxalic acid', capacity: 250, contents: 10 }
  assert.equal(getMergedContents(flaskWith10, hcl, 5), 15)
})

test('merged contents: heating or a transfer keeps the liquid of both items', () => {
  const burner = { name: 'Bunsen Burner', type: 'TOOL', volume: null }
  const solution = { name: 'Heated mix', capacity: 250, contents: 40 }
  assert.equal(getMergedContents(solution, burner, 0), 40)

  const pipetteSolution = { name: 'NaOH (pipetted)', capacity: null, contents: 25 }
  const flaskWith10 = { name: 'Flask', capacity: 250, contents: 10 }
  assert.equal(getMergedContents(flaskWith10, pipetteSolution, 0), 35)
})

test('a result does not inherit the capacity of the burette that dispensed into it', () => {
  const cup = { name: 'Sodium Hydroxide Solution in Cup', capacity: null, contents: 50 }
  const burette = { name: 'HCl solution in Burette', capacity: 50, contents: 50 }
  assert.equal(getMergedCapacity(cup, burette), null)
  const beaker = { name: '400cm3 Beaker', type: 'TOOL', volume: 400 }
  assert.equal(getMergedCapacity({ name: 'NaCl', type: 'SUBSTANCE' }, beaker), 400)
})

test('volume caption drops a volume already written into the result name', () => {
  assert.equal(
    formatVolumeCaption(100, '1000cm3 of Hydrochloric Acid', 0.5),
    '100.0 cm³ of Hydrochloric Acid'
  )
  assert.equal(
    formatVolumeCaption(25, '25cm3 Oxalic Acid Solution in Conical Flask', 5),
    '25 cm³ of Oxalic Acid Solution in Conical Flask'
  )
  assert.equal(
    formatVolumeCaption(25, 'Pipette with 25cm3 Oxalic Acid', 0.05),
    '25.00 cm³ of Pipette with 25cm3 Oxalic Acid'
  )
  assert.equal(formatVolumeCaption(0, 'Sodium Carbonate', 0.5), 'Sodium Carbonate')
})

test('only stockroom substances and vessels holding liquid are poured from', () => {
  // Poured: stockroom substance, filled pipette, filled burette
  assert.equal(isLiquidSource({ name: 'Methyl Orange', type: 'SUBSTANCE' }), true)
  assert.equal(
    isLiquidSource({ name: 'Pipette with 25cm3 NaOH', type: 'SUBSTANCE', capacity: null, contents: 25 }),
    true
  )
  // Placed, not poured: raw apparatus and merged objects holding no liquid
  assert.equal(isLiquidSource({ name: 'Thermometer', type: 'TOOL', volume: null }), false)
  assert.equal(isLiquidSource({ name: 'Zinc Strip', type: 'TOOL', volume: null }), false)
  assert.equal(
    isLiquidSource({ name: 'Copper Wire', type: 'TOOL', capacity: null, contents: 0 }),
    false
  )
  assert.equal(
    isLiquidSource({ name: 'Hot Copper Wire', type: 'SUBSTANCE', capacity: null, contents: 0 }),
    false
  )
})

test('step tolerance prefers the merge rule over instrument precision', () => {
  assert.equal(getStepTolerance({ tolerance: 10 }, 0.05), 10)
  assert.equal(getStepTolerance({}, 0.05), 0.05)
  assert.equal(getStepTolerance(undefined, 0.5), 0.5)
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

test('pickContainer: a filled burette titrates into the flask, whichever way round the rule is', () => {
  const burette = {
    name: 'Sodium Hydroxide Solution in Burette',
    type: 'SUBSTANCE',
    image: 'https://example.com/media/substances/50mLBurette_kH9ugGL.svg',
    capacity: 50,
    contents: 50,
  }
  const flask = {
    name: '25cm3 of HCl with Phenolphthalein',
    type: 'SUBSTANCE',
    capacity: 250,
    contents: 25,
  }
  const rule = { with: { apparatus: burette.name, substance: flask.name } }
  assert.equal(pickContainer(flask, burette, rule), flask)
  assert.equal(pickContainer(burette, flask, rule), flask)
  assert.equal(getPourLimits(pickContainer(flask, burette, rule), rule).maxVolume, 225)
})

test('a titration cannot pour more than the burette holds', () => {
  const burette = {
    name: 'Sodium Hydroxide Solution in Burette',
    image: 'https://example.com/media/substances/50mLBurette_kH9ugGL.svg',
    capacity: 50,
    contents: 30,
  }
  const flask = { name: 'HCl with Phenolphthalein', capacity: 250, contents: 25 }
  const limits = getPourLimits(flask, {}, burette)
  assert.equal(limits.maxVolume, 30)
  assert.equal(limits.limitedBy, 'burette')

  // Room in the flask is the tighter limit
  const nearlyFull = { name: 'Almost full', capacity: 250, contents: 240 }
  const tight = getPourLimits(nearlyFull, {}, burette)
  assert.equal(tight.maxVolume, 10)
  assert.equal(tight.limitedBy, 'container')

  // Pouring from a stockroom substance is not limited by any burette
  const naoh = { name: 'Sodium Hydroxide', type: 'SUBSTANCE' }
  assert.equal(getPourLimits(flask, {}, naoh).limitedBy, 'container')
})

test('pickContainer: filling an empty burette from the stockroom keeps the burette', () => {
  const burette = { name: '50ml Burrette', type: 'TOOL', volume: null }
  const naoh = { name: 'Sodium Hydroxide', type: 'SUBSTANCE' }
  const rule = { with: { apparatus: '50ml Burrette', substance: 'Sodium Hydroxide' } }
  assert.equal(pickContainer(naoh, burette, rule), burette)
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

test('getInstrumentPrecision prioritizes explicit precision on apparatus', () => {
  assert.equal(getInstrumentPrecision(burette50), 0.05)
  assert.equal(getInstrumentPrecision({ precision: 0.1 }), 0.1)
})

test('getInstrumentPrecision falls back to sensible defaults by name/type', () => {
  assert.equal(getInstrumentPrecision({ name: '50 mL Burette' }), 0.05)
  assert.equal(getInstrumentPrecision({ name: '25 mL Pipette' }), 0.05)
  assert.equal(getInstrumentPrecision({ name: '250 mL Volumetric Flask' }), 0.15)
  assert.equal(getInstrumentPrecision(cylinder10), 0.2)
  assert.equal(getInstrumentPrecision(cylinder100), 0.5)
  assert.equal(getInstrumentPrecision(beaker250), 5.0)
  assert.equal(getInstrumentPrecision({ name: '1000 mL Beaker', volume: 1000 }), 10.0)
  assert.equal(getInstrumentPrecision({ name: '250 mL Conical Flask' }), 5.0)
  assert.equal(getInstrumentPrecision({ name: 'Dropper' }), 0.1)
  assert.equal(getInstrumentPrecision(null), 0.5)
})

test('getInstrumentPrecision tolerates misspelled names from the database', () => {
  assert.equal(getInstrumentPrecision({ name: '5ml Pippette' }), 0.05)
  assert.equal(getInstrumentPrecision({ name: '50ml Burrette' }), 0.05)
})

test('getPrecisionDecimals calculates correct decimal places', () => {
  assert.equal(getPrecisionDecimals(0.05), 2)
  assert.equal(getPrecisionDecimals(0.5), 1)
  assert.equal(getPrecisionDecimals(5), 0)
  assert.equal(getPrecisionDecimals(0.001), 3)
})

test('formatWithPrecision preserves significant digits according to precision', () => {
  assert.equal(formatWithPrecision(25, 0.05), '25.00')
  assert.equal(formatWithPrecision(25.4, 0.5), '25.4')
  assert.equal(formatWithPrecision(25.45, 5), '25')
  assert.equal(formatWithPrecision(0.2, 0.05), '0.20')
})

test('getInstrumentStep gives stepped increments matching instrument precision', () => {
  assert.equal(getInstrumentStep(0.05), 0.05)
  assert.equal(getInstrumentStep(0.2), 0.2)
  assert.equal(getInstrumentStep(0.5), 0.5)
  assert.equal(getInstrumentStep(5), 5)
})

test('applyReadingError jitters within ±precision bounds and rounds to decimals', () => {
  // Mock rng at midpoint (0.5) -> 0 offset
  const mid = applyReadingError(25, 0.05, () => 0.5)
  assert.equal(mid, 25.0)

  // Mock rng at max (1.0) -> +precision offset (25 + 0.05 = 25.05)
  const max = applyReadingError(25, 0.05, () => 1.0)
  assert.equal(max, 25.05)

  // Mock rng at min (0.0) -> -precision offset (25 - 0.05 = 24.95)
  const min = applyReadingError(25, 0.05, () => 0.0)
  assert.equal(min, 24.95)
})

test('evaluatePourTolerance accepts pours within tolerance band', () => {
  const result = evaluatePourTolerance(25.03, 25, 0.05)
  assert.equal(result.isAcceptable, true)
  assert.equal(result.minAcceptable, 24.95)
  assert.equal(result.maxAcceptable, 25.05)
})

test('evaluatePourTolerance rejects pours outside tolerance band', () => {
  const tooHigh = evaluatePourTolerance(25.10, 25, 0.05)
  assert.equal(tooHigh.isAcceptable, false)

  const tooLow = evaluatePourTolerance(24.90, 25, 0.05)
  assert.equal(tooLow.isAcceptable, false)
})

