import axios from 'axios'
import server, { getAuthHeader } from '../utils.js'

export interface MeasurementRecord {
  stepIndex: number
  description?: string
  apparatusName?: string
  substanceName?: string
  targetVolume?: number // Target / recommended volume in cm³
  inputVolume?: number // Volume entered by student in cm³
  recordedVolume: number // Volume after reading error jitter in cm³
  unit: string
  precision: number // Instrument precision in cm³
  tolerance: number // Step tolerance in cm³
  isAcceptable: boolean // Within tolerance band
  difference: number // recordedVolume - targetVolume
  timestamp: number
  phValue?: number | null
  reactionResult?: any
}

export interface StepGradeEvaluation {
  stepIndex: number
  targetAdherence: number // 0 - 100
  precisionAdherence: number // 0 - 100
  stepGrade: number // Combined 0 - 100
  difference: number
  isWithinTolerance: boolean
  feedback: string
}

export interface GradeEvaluation {
  overallGrade: number // 0 - 100
  averageTargetAdherence: number
  averagePrecisionAdherence: number
  stepEvaluations: StepGradeEvaluation[]
  feedback: string
}

export interface SessionTelemetry {
  sessionId?: string
  lessonId: number | string
  studentEmail?: string
  startedAt: number
  completedAt?: number
  measurements: MeasurementRecord[]
  totalSteps: number
  completedSteps: number
  grading?: GradeEvaluation
}

/**
 * Evaluates a single measurement step against recommended volume, tolerance, and instrument precision.
 */
export function evaluateStepMeasurement(
  record: Partial<MeasurementRecord>
): StepGradeEvaluation {
  const measured = record.recordedVolume ?? record.inputVolume ?? 0
  const target = record.targetVolume
  const precision =
    record.precision != null && record.precision > 0 ? record.precision : 0.5
  const tolerance =
    record.tolerance != null && record.tolerance > 0
      ? record.tolerance
      : precision

  if (target == null || target <= 0) {
    return {
      stepIndex: record.stepIndex ?? 0,
      targetAdherence: 100.0,
      precisionAdherence: 100.0,
      stepGrade: 100.0,
      difference: 0.0,
      isWithinTolerance: true,
      feedback: `Step ${
        (record.stepIndex ?? 0) + 1
      }: Qualitative action completed.`,
    }
  }

  const diff = measured - target
  const absDiff = Math.abs(diff)
  const isWithinTolerance = absDiff <= tolerance + 1e-6

  // 1. Target Adherence (0 - 100)
  let targetAdherence: number
  if (tolerance > 0) {
    const ratio = absDiff / tolerance
    if (ratio <= 1.0) {
      targetAdherence = 100.0 - ratio * 20.0 // 80% to 100%
    } else {
      targetAdherence = Math.max(0.0, 80.0 - (ratio - 1.0) * 40.0)
    }
  } else {
    targetAdherence = Math.max(0.0, 100.0 * (1.0 - absDiff / target))
  }

  // 2. Precision Adherence (0 - 100)
  let precisionAdherence: number
  if (precision > 0) {
    const precRatio = absDiff / precision
    if (precRatio <= 1.0) {
      precisionAdherence = 100.0 - precRatio * 15.0
    } else if (isWithinTolerance) {
      precisionAdherence = Math.max(60.0, 85.0 - (precRatio - 1.0) * 15.0)
    } else {
      precisionAdherence = Math.max(0.0, 60.0 - (precRatio - 1.0) * 25.0)
    }
  } else {
    precisionAdherence = targetAdherence
  }

  // Combined step grade: 70% target adherence, 30% precision adherence
  const stepGrade =
    Math.round((0.7 * targetAdherence + 0.3 * precisionAdherence) * 10) / 10

  const feedback =
    `Step ${(record.stepIndex ?? 0) + 1}: Measured ${measured.toFixed(
      2
    )} cm³ ` +
    `(Target: ${target.toFixed(2)} cm³, Tol: ±${tolerance.toFixed(
      2
    )}, Score: ${stepGrade}%).`

  return {
    stepIndex: record.stepIndex ?? 0,
    targetAdherence: Math.round(targetAdherence * 10) / 10,
    precisionAdherence: Math.round(precisionAdherence * 10) / 10,
    stepGrade,
    difference: Math.round(diff * 10000) / 10000,
    isWithinTolerance,
    feedback,
  }
}

/**
 * Calculates dynamic grade and feedback from recorded student telemetry measurements.
 */
export function calculateSessionGrade(
  measurements: MeasurementRecord[]
): GradeEvaluation {
  if (!measurements || measurements.length === 0) {
    return {
      overallGrade: 100.0,
      averageTargetAdherence: 100.0,
      averagePrecisionAdherence: 100.0,
      stepEvaluations: [],
      feedback: 'Completed experiment.',
    }
  }

  const stepEvaluations = measurements.map((m) => evaluateStepMeasurement(m))

  const avgTarget =
    stepEvaluations.reduce((sum, e) => sum + e.targetAdherence, 0) /
    stepEvaluations.length
  const avgPrecision =
    stepEvaluations.reduce((sum, e) => sum + e.precisionAdherence, 0) /
    stepEvaluations.length
  const rawGrade =
    stepEvaluations.reduce((sum, e) => sum + e.stepGrade, 0) /
    stepEvaluations.length
  const overallGrade = Math.round(rawGrade * 10) / 10

  const stepFeedbacks = stepEvaluations.map((e) => e.feedback).join(' | ')
  const feedback = `Dynamic Grade: ${overallGrade}% (Accuracy: ${avgTarget.toFixed(
    1
  )}%, Precision: ${avgPrecision.toFixed(1)}%). ${stepFeedbacks}`

  return {
    overallGrade,
    averageTargetAdherence: Math.round(avgTarget * 10) / 10,
    averagePrecisionAdherence: Math.round(avgPrecision * 10) / 10,
    stepEvaluations,
    feedback,
  }
}

/**
 * Persists session telemetry to backend API.
 */
export async function persistSessionTelemetry(
  lessonId: number | string,
  measurements: any,
  sessionId?: string
): Promise<any> {
  const headers = { 'Content-Type': 'application/json', ...getAuthHeader() }
  const url = `${server.absolute_url}/${
    server.sessions || 'api/v1/workspace/sessions/'
  }`

  const payload: any = {
    lesson: lessonId,
    measurements,
  }
  if (sessionId) {
    payload.id = sessionId
  }

  try {
    const res = await axios.post(url, payload, { headers })
    return res.data
  } catch (err) {
    console.warn('Failed to persist session telemetry:', err)
    return null
  }
}
