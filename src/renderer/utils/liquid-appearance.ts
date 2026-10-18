// What the liquid in a vessel looks like, derived from the chemistry on the
// bench. Pure functions with no React, so the colour rules can be tested.
//
// Indicators change colour with pH over their published transition ranges;
// coloured solutions show the colour of what they contain; anything else is
// a faint water tint so the level is still visible. Bubbles when the
// reaction engine reports a gas.

export interface LiquidAppearance {
  color: string
  opacity: number
  bubbling: boolean
  label?: string
}

export const GAS_FORMULAE = new Set([
  'CO2',
  'H2',
  'O2',
  'SO2',
  'NH3',
  'Cl2',
  'NO2',
  'H2S',
])

export const INDICATORS: Array<{
  name: string
  match: RegExp
  colour: (ph: number) => { color: string; label: string }
}> = [
  {
    name: 'methyl orange',
    match: /methyl\s*orange/i,
    // transition range 3.1 - 4.4
    colour: (ph) =>
      ph < 3.1
        ? { color: '#e0332e', label: 'methyl orange, acidic' }
        : ph > 4.4
        ? { color: '#f2c12e', label: 'methyl orange, alkaline' }
        : { color: '#ec7a2a', label: 'methyl orange, end point' },
  },
  {
    name: 'phenolphthalein',
    match: /phenolphthalein/i,
    // transition range 8.2 - 10
    colour: (ph) =>
      ph < 8.2
        ? { color: '#d9e3ea', label: 'phenolphthalein, colourless' }
        : ph > 10
        ? { color: '#e6338f', label: 'phenolphthalein, pink' }
        : { color: '#efa0c8', label: 'phenolphthalein, faint pink' },
  },
  {
    name: 'litmus',
    match: /litmus/i,
    // transition range roughly 5 - 8
    colour: (ph) =>
      ph < 5
        ? { color: '#d94d4d', label: 'litmus, red' }
        : ph > 8
        ? { color: '#4d6fd9', label: 'litmus, blue' }
        : { color: '#8e6cc2', label: 'litmus, purple' },
  },
]

// First match wins.
export const SOLUTION_COLOURS: Array<{
  match: RegExp
  color: string
  label: string
}> = [
  {
    match: /permanganate|KMnO4/i,
    color: '#6a1b9a',
    label: 'permanganate, purple',
  },
  { match: /copper|CuSO4/i, color: '#2e86c1', label: 'copper(II), blue' },
  {
    match: /ferrous|iron\s*\(?ii\)?|FeSO4/i,
    color: '#8fbf8f',
    label: 'iron(II), pale green',
  },
  {
    match: /ferric|iron\s*\(?iii\)?|FeCl3/i,
    color: '#c9872b',
    label: 'iron(III), yellow-brown',
  },
  { match: /iodine|\bI2\b/i, color: '#8b4513', label: 'iodine, brown' },
  { match: /dichromate|Cr2O7/i, color: '#e67e22', label: 'dichromate, orange' },
  { match: /nickel/i, color: '#5fb57a', label: 'nickel, green' },
  { match: /cobalt/i, color: '#d6537c', label: 'cobalt, pink' },
]

export const COLOURLESS: LiquidAppearance = {
  color: '#7fc4e8',
  opacity: 0.45,
  bubbling: false,
  label: 'colourless solution',
}

export function isGasProduct(formula: string): boolean {
  return GAS_FORMULAE.has(
    String(formula)
      .replace(/\(.*\)/, '')
      .trim()
  )
}

export function liquidAppearance(item: any): LiquidAppearance | null {
  const contents = Number(item?.contents ?? item?.volume ?? 0)
  if (!(contents > 0)) return null

  const ph =
    item?.phValue != null && Number.isFinite(Number(item.phValue))
      ? Number(item.phValue)
      : null
  const haystack = [
    item?.name,
    item?.displayName,
    item?.formula,
    item?.substanceName,
  ]
    .filter(Boolean)
    .join(' ')

  const products = item?.reactionResult?.products
    ? Object.keys(item.reactionResult.products)
    : []
  const bubbling =
    item?.reactionResult?.reaction_type === 'gas_evolution' ||
    products.some(isGasProduct)

  // An indicator in the mixture takes priority: that is the point of adding one.
  if (ph != null) {
    for (const ind of INDICATORS) {
      if (ind.match.test(haystack)) {
        const c = ind.colour(ph)
        return { color: c.color, opacity: 0.6, bubbling, label: c.label }
      }
    }
  }
  for (const sol of SOLUTION_COLOURS) {
    if (sol.match.test(haystack)) {
      return { color: sol.color, opacity: 0.55, bubbling, label: sol.label }
    }
  }
  return { ...COLOURLESS, bubbling }
}

// A pour that is a small fraction of a big vessel must still be visible:
// 20 cm3 in a 400 cm3 beaker is 5%, a few pixels. Levels scale from this
// floor up to the brim.
export const MIN_VISIBLE_FRACTION = 0.14

export function fillFraction(contents: number, capacity: number): number {
  if (!(contents > 0)) return 0
  const raw = capacity > 0 ? Math.min(1, contents / capacity) : 0.4
  return MIN_VISIBLE_FRACTION + raw * (1 - MIN_VISIBLE_FRACTION)
}
