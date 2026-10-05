// Volume limits and labels for pouring on the workbench.
// Kept free of React/DOM so it can be tested with `node --test`.

// Used when a container's capacity is unknown (apparatus without a volume, legacy data).
export const LEGACY_MAX_VOLUME = 500
// Not enforced or shown: a step only has a target when its merge rule sets targetVolume,
// so students are never held to an amount their written procedure doesn't mention.
export const LEGACY_RECOMMENDED_VOLUME = 200

const CM3_PER_UNIT: Record<string, number> = { 'cm³': 1, 'dm³': 1000 }

export function toCm3(value: number, unit: string): number {
  return value * (CM3_PER_UNIT[unit] ?? 1)
}

// Apparatus names in the database are often misspelled ('5ml Pippette', '50ml Burrette').
const PIPETTE_PATTERN = /pip+et+e/i
const BURETTE_PATTERN = /bur+et+e/i

export function isPipette(item: any): boolean {
  return PIPETTE_PATTERN.test(item?.name || '')
}

// Capacity written into an apparatus name, in cm³: "250cm3 Conical Flask" -> 250,
// "1000 mL Beaker" -> 1000, "1 litre Flask" -> 1000. Null when the name has none.
export function parseCapacityFromName(name?: string | null): number | null {
  const match = (name || '').match(
    /(\d+(?:\.\d+)?)\s*(litres?|liters?|cm3|cm³|ml|dm3|dm³|l)(?![a-z])/i
  )
  if (!match) return null
  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  const isLitres = unit.startsWith('l') || unit.startsWith('dm')
  return isLitres ? value * 1000 : value
}

// Capacity in cm³, or null when unknown.
// Merged items carry `capacity` explicitly; raw apparatus (TOOL) use their `volume` field,
// falling back to a size in the name. A volume of 0 means "not set" (the CMS stores 0 for
// e.g. the Evaporating Dish and Funnel), not a container that holds nothing.
// Pipettes are left unconstrained: the curriculum has students transfer 25 cm³ with the
// '5ml Pippette' in a single step.
export function getCapacity(item: any): number | null {
  if (!item) return null
  if ('capacity' in item) return item.capacity ?? null
  if (item.type === 'TOOL') {
    if (isPipette(item)) return null
    if (item.volume > 0) return item.volume
    return parseCapacityFromName(item.name)
  }
  return null
}

// Liquid already in the container, in cm³. On raw apparatus `volume` is the capacity,
// so liquid only ever comes from `contents`.
export function getContents(item: any): number {
  return item?.contents ?? 0
}

// Whether an item can be poured from: a stockroom substance (merged results always carry
// `capacity`), or a vessel already holding liquid such as a filled pipette or burette.
// Objects holding nothing — a wire, metal strip, thermometer, stirrer — are placed into a
// container rather than poured, so no volume is asked for.
export function isLiquidSource(item: any): boolean {
  const isStockroomSubstance =
    item?.type === 'SUBSTANCE' && !('capacity' in item)
  return isStockroomSubstance || getContents(item) > 0
}

// Liquid in the result of a merge, in cm³. A pour adds to what the receiving container
// already holds; combining two vessels without a pour (a transfer, heating) keeps the
// liquid of both.
export function getMergedContents(
  container: any,
  other: any,
  pouredCm3: number
): number {
  if (pouredCm3 > 0) return getContents(container) + pouredCm3
  return getContents(container) + getContents(other)
}

// Capacity of a merge result: the receiving container's, else the other item's — except a
// burette that dispensed into the container, whose 50 cm³ says nothing about the result.
export function getMergedCapacity(container: any, other: any): number | null {
  const own = getCapacity(container)
  if (own !== null) return own
  return isBurette(other) ? null : getCapacity(other)
}

// Workbench caption, e.g. "100 cm³ of Hydrochloric Acid". Result names authored with a
// volume up front ("1000cm3 of Hydrochloric Acid") would otherwise read
// "100 cm³ of 1000cm3 of Hydrochloric Acid", so that leading volume is dropped.
export function formatVolumeCaption(
  volume: number,
  name: string,
  precision: number
): string {
  if (!(volume > 0)) return name
  const baseName = name.replace(
    /^\s*\d+(?:\.\d+)?\s*(?:cm3|cm³|ml)\s+(?:of\s+)?/i,
    ''
  )
  return `${formatWithPrecision(volume, precision)} cm³ of ${baseName}`
}

// Tolerance a step allows around its target volume, in cm³.
export function getStepTolerance(mergeRule: any, precision: number): number {
  return mergeRule?.tolerance ?? precision
}

export interface PourLimits {
  capacity: number | null
  contents: number
  maxVolume: number
  recommendedVolume: number | null
  // What sets maxVolume: the space left in the container, or the liquid left in the
  // burette pouring into it.
  limitedBy: 'container' | 'burette'
}

// A step's targetVolume always fits: the merge rule is authoritative even when the
// container's recorded capacity disagrees with it. When the liquid comes from a filled
// burette (a titration), no more can be poured than the burette holds.
export function getPourLimits(
  container: any,
  mergeRule?: any,
  source?: any
): PourLimits {
  const capacity = getCapacity(container)
  const contents = getContents(container)
  const recommendedVolume = mergeRule?.targetVolume ?? null
  const spaceLeft =
    capacity === null ? LEGACY_MAX_VOLUME : Math.max(capacity - contents, 0)
  const containerMax = Math.max(spaceLeft, recommendedVolume ?? 0)

  const buretteHolds =
    isBurette(source) && getContents(source) > 0 ? getContents(source) : null
  if (buretteHolds !== null && buretteHolds < containerMax) {
    return {
      capacity,
      contents,
      maxVolume: buretteHolds,
      recommendedVolume,
      limitedBy: 'burette',
    }
  }

  return {
    capacity,
    contents,
    maxVolume: containerMax,
    recommendedVolume,
    limitedBy: 'container',
  }
}

// A burette, or a solution held in one (merged results keep the burette image).
export function isBurette(item: any): boolean {
  return (
    BURETTE_PATTERN.test(item?.name || '') ||
    BURETTE_PATTERN.test(item?.image || '')
  )
}

// Apparatus or a merged solution (merged results carry `capacity`); not a stockroom substance.
function isVessel(item: any): boolean {
  return item?.type === 'TOOL' || (!!item && 'capacity' in item)
}

// In a merge rule, `with.apparatus` names the receiving container. Falls back to the
// non-substance item for rules that don't match either name. A filled burette always
// dispenses into the other vessel (a titration), whichever way round the rule names them.
export function pickContainer(item1: any, item2: any, mergeRule?: any): any {
  const apparatusName = mergeRule?.with?.apparatus
  let container
  if (apparatusName === item1?.name) container = item1
  else if (apparatusName === item2?.name) container = item2
  else container = item1?.type === 'SUBSTANCE' ? item2 : item1

  const other = container === item1 ? item2 : item1
  if (
    isBurette(container) &&
    getContents(container) > 0 &&
    isVessel(other) &&
    !isBurette(other)
  ) {
    return other
  }
  return container
}

// Up to 2 decimal places, without trailing zeros: 7.4 -> "7.4", 1.0 -> "1", 12.345 -> "12.35".
export function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100)
}

// e.g. "0.1 M · pH 1"; empty string when neither is known.
export function formatSubstanceLabel(substance: any): string {
  const parts: string[] = []
  if (substance?.molarity != null)
    parts.push(`${formatNumber(substance.molarity)} M`)
  if (substance?.phValue != null)
    parts.push(`pH ${formatNumber(substance.phValue)}`)
  return parts.join(' · ')
}

// Sensible precision defaults (in cm³ / mL) by apparatus type/name when apparatus.precision is not set
export const DEFAULT_INSTRUMENT_PRECISION: Record<string, number> = {
  burette: 0.05,
  pipette: 0.05,
  volumetric: 0.15,
  cylinder: 0.5,
  beaker: 5.0,
  conical: 5.0,
  dropper: 0.1,
}

// Precision in cm³ (e.g., ±0.05 mL, ±0.5 mL, ±5 mL)
export function getInstrumentPrecision(item: any): number {
  if (!item) return 0.5
  if (
    typeof item.precision === 'number' &&
    !isNaN(item.precision) &&
    item.precision > 0
  ) {
    return item.precision
  }
  const name = (item.name || item.type || '').toLowerCase()
  if (BURETTE_PATTERN.test(name)) return DEFAULT_INSTRUMENT_PRECISION.burette
  if (PIPETTE_PATTERN.test(name)) return DEFAULT_INSTRUMENT_PRECISION.pipette
  if (name.includes('volumetric'))
    return DEFAULT_INSTRUMENT_PRECISION.volumetric
  if (name.includes('cylinder')) {
    if (item.volume && item.volume <= 10) return 0.2
    return DEFAULT_INSTRUMENT_PRECISION.cylinder
  }
  if (name.includes('beaker')) {
    if (item.volume && item.volume >= 1000) return 10.0
    return DEFAULT_INSTRUMENT_PRECISION.beaker
  }
  if (name.includes('conical')) return DEFAULT_INSTRUMENT_PRECISION.conical
  if (name.includes('dropper')) return DEFAULT_INSTRUMENT_PRECISION.dropper
  return 0.5
}

// Decimal places corresponding to an instrument's precision (e.g. 0.05 -> 2, 0.5 -> 1, 5 -> 0)
export function getPrecisionDecimals(precision: number): number {
  if (precision >= 1) return 0
  const str = precision.toString()
  const dotIndex = str.indexOf('.')
  return dotIndex >= 0 ? str.length - dotIndex - 1 : 0
}

// Formats a number with significant figures matching instrument precision (e.g. 25 -> "25.00" for 0.05 precision)
export function formatWithPrecision(value: number, precision: number): string {
  const decimals = getPrecisionDecimals(precision)
  return Number(value).toFixed(decimals)
}

// Stepped input increment matching instrument step size (e.g. 0.05 mL for burette)
export function getInstrumentStep(precision: number): number {
  if (precision <= 0.05) return 0.05
  if (precision <= 0.1) return 0.1
  if (precision <= 0.2) return 0.2
  if (precision <= 0.5) return 0.5
  if (precision <= 1.0) return 1.0
  return precision
}

// Simulates human reading error / meniscus curvature within [-precision, +precision].
// An optional rng function can be injected for deterministic testing.
export function applyReadingError(
  volume: number,
  precision: number,
  rng: () => number = Math.random
): number {
  if (precision <= 0) return volume
  const offset = (rng() * 2 - 1) * precision
  const jittered = volume + offset
  const decimals = getPrecisionDecimals(precision)
  const factor = Math.pow(10, decimals)
  return Math.round(jittered * factor) / factor
}

export interface ToleranceEvaluation {
  isAcceptable: boolean
  pouredVolume: number
  targetVolume: number
  tolerance: number
  minAcceptable: number
  maxAcceptable: number
  difference: number
}

// Evaluates whether a poured volume is acceptable given a step target and instrument tolerance
export function evaluatePourTolerance(
  pouredVolume: number,
  targetVolume: number,
  tolerance: number
): ToleranceEvaluation {
  const minAcceptable = Math.max(0, targetVolume - tolerance)
  const maxAcceptable = targetVolume + tolerance
  const isAcceptable =
    pouredVolume >= minAcceptable - 1e-6 && pouredVolume <= maxAcceptable + 1e-6
  const difference = pouredVolume - targetVolume

  return {
    isAcceptable,
    pouredVolume,
    targetVolume,
    tolerance,
    minAcceptable,
    maxAcceptable,
    difference,
  }
}
