import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateStepMeasurement,
  calculateSessionGrade,
} from './lab-grading.ts'

test('perfect measurement scores 100% on target and precision adherence', () => {
  const result = evaluateStepMeasurement({
    stepIndex: 0,
    targetVolume: 25.0,
    recordedVolume: 25.0,
    precision: 0.05,
    tolerance: 0.1,
  })

  assert.equal(result.stepGrade, 100.0)
  assert.equal(result.targetAdherence, 100.0)
  assert.equal(result.precisionAdherence, 100.0)
  assert.equal(result.difference, 0.0)
  assert.equal(result.isWithinTolerance, true)
  assert.match(result.feedback, /Score: 100%/)
})

test('measurement within tolerance achieves high passing grade', () => {
  // 0.04 cm³ deviation on 0.1 cm³ tolerance
  const result = evaluateStepMeasurement({
    stepIndex: 0,
    targetVolume: 25.0,
    recordedVolume: 25.04,
    precision: 0.05,
    tolerance: 0.1,
  })

  assert.equal(result.isWithinTolerance, true)
  assert.ok(result.stepGrade >= 90.0, `Expected >= 90.0, got ${result.stepGrade}`)
})

test('measurement exceeding tolerance is heavily penalized', () => {
  const result = evaluateStepMeasurement({
    stepIndex: 1,
    targetVolume: 25.0,
    recordedVolume: 28.0,
    precision: 0.05,
    tolerance: 0.5,
  })

  assert.equal(result.isWithinTolerance, false)
  assert.ok(result.stepGrade < 50.0, `Expected < 50.0, got ${result.stepGrade}`)
  assert.match(result.feedback, /Measured 28.00 cm³/)
})

test('qualitative step without target volume awards full credit', () => {
  const result = evaluateStepMeasurement({
    stepIndex: 2,
    recordedVolume: 0,
    targetVolume: undefined,
  })

  assert.equal(result.stepGrade, 100.0)
  assert.equal(result.isWithinTolerance, true)
})

test('calculateSessionGrade evaluates multi-step experiment telemetry', () => {
  const telemetry = [
    {
      stepIndex: 0,
      targetVolume: 25.0,
      recordedVolume: 25.0,
      precision: 0.05,
      tolerance: 0.1,
      unit: 'cm³',
      isAcceptable: true,
      difference: 0.0,
      timestamp: Date.now(),
    },
    {
      stepIndex: 1,
      targetVolume: 20.0,
      recordedVolume: 19.98,
      precision: 0.05,
      tolerance: 0.1,
      unit: 'cm³',
      isAcceptable: true,
      difference: -0.02,
      timestamp: Date.now(),
    },
  ]

  const sessionGrade = calculateSessionGrade(telemetry)
  assert.ok(sessionGrade.overallGrade >= 95.0, `Expected >= 95.0, got ${sessionGrade.overallGrade}`)
  assert.equal(sessionGrade.stepEvaluations.length, 2)
  assert.match(sessionGrade.feedback, /Dynamic Grade:/)
  assert.match(sessionGrade.feedback, /Accuracy:/)
  assert.match(sessionGrade.feedback, /Precision:/)
})

test('calculateSessionGrade returns 100% for empty measurements', () => {
  const sessionGrade = calculateSessionGrade([])
  assert.equal(sessionGrade.overallGrade, 100.0)
})
