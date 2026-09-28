// Volume limits and labels for pouring on the workbench.
// Kept free of React/DOM so it can be tested with `node --test`.

// Used when a container's capacity is unknown (apparatus without a volume, legacy data).
export const LEGACY_MAX_VOLUME = 500
export const LEGACY_RECOMMENDED_VOLUME = 200

const CM3_PER_UNIT: Record<string, number> = { 'cm³': 1, 'dm³': 1000 }

export function toCm3(value: number, unit: string): number {
  return value * (CM3_PER_UNIT[unit] ?? 1)
}

// Capacity in cm³, or null when unknown.
// Merged items carry `capacity` explicitly; raw apparatus (TOOL) use their `volume` field.
export function getCapacity(item: any): number | null {
  if (!item) return null
  if ('capacity' in item) return item.capacity ?? null
  if (item.type === 'TOOL') return item.volume ?? null
  return null
}

// Liquid already in the container, in cm³.
export function getContents(item: any): number {
  return item?.contents ?? 0
}

export interface PourLimits {
  capacity: number | null
  contents: number
  maxVolume: number
  recommendedVolume: number | null
}

export function getPourLimits(container: any, mergeRule?: any): PourLimits {
  const capacity = getCapacity(container)
  const contents = getContents(container)

  if (capacity === null) {
    return {
      capacity,
      contents,
      maxVolume: LEGACY_MAX_VOLUME,
      recommendedVolume: mergeRule?.targetVolume ?? LEGACY_RECOMMENDED_VOLUME,
    }
  }

  return {
    capacity,
    contents,
    maxVolume: Math.max(capacity - contents, 0),
    recommendedVolume: mergeRule?.targetVolume ?? null,
  }
}

// In a merge rule, `with.apparatus` names the receiving container. Falls back to the
// non-substance item for rules that don't match either name.
export function pickContainer(item1: any, item2: any, mergeRule?: any): any {
  const apparatusName = mergeRule?.with?.apparatus
  if (apparatusName === item1?.name) return item1
  if (apparatusName === item2?.name) return item2
  return item1?.type === 'SUBSTANCE' ? item2 : item1
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
