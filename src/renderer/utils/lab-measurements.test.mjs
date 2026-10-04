// Run with: yarn test  (Node's built-in test runner; needs Node >= 22.18 to import .ts directly)
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  LEGACY_MAX_VOLUME,
  LEGACY_RECOMMENDED_VOLUME,
  formatNumber,
  formatSubstanceLabel,
  getCapacity,
  getMergedContents,
  getPourLimits,
  getStepTolerance,
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

test('unknown capacity falls back to the legacy 500 / 200 limits', () => {
  const limits = getPourLimits(thermometer)
  assert.equal(limits.maxVolume, LEGACY_MAX_VOLUME)
  assert.equal(limits.recommendedVolume, LEGACY_RECOMMENDED_VOLUME)
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

