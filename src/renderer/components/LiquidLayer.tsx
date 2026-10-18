import React, { useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// What the liquid in a vessel looks like.
//
// Until now a merge changed a caption and a pH badge and nothing else: the
// vessel image stayed an empty line drawing. A real practical teaches through
// the eyes that something happened -- the level rises, an indicator turns,
// a carbonate fizzes. This layer paints a liquid inside the vessel outline,
// coloured from the chemistry already on the bench, and bubbles when a gas
// was produced. No new artwork is needed: the apparatus SVGs are transparent
// inside their outlines, so a tinted band drawn behind them reads as contents.
// ---------------------------------------------------------------------------

export interface LiquidAppearance {
  color: string // CSS colour of the liquid
  opacity: number
  bubbling: boolean
  label?: string // short reason, for tooltips/telemetry (e.g. "methyl orange, acidic")
}

const GAS_FORMULAE = new Set(['CO2', 'H2', 'O2', 'SO2', 'NH3', 'Cl2', 'NO2', 'H2S'])

// Indicators change colour with pH; everything else is coloured by what it is.
const INDICATORS: Array<{
  match: RegExp
  colour: (ph: number) => { color: string; label: string }
}> = [
  {
    match: /methyl\s*orange/i,
    colour: (ph) =>
      ph < 3.1
        ? { color: '#e0332e', label: 'methyl orange, acidic' }
        : ph > 4.4
        ? { color: '#f2c12e', label: 'methyl orange, alkaline' }
        : { color: '#ec7a2a', label: 'methyl orange, end point' },
  },
  {
    match: /phenolphthalein/i,
    colour: (ph) =>
      ph < 8.2
        ? { color: '#d9e3ea', label: 'phenolphthalein, colourless' }
        : ph > 10
        ? { color: '#e6338f', label: 'phenolphthalein, pink' }
        : { color: '#efa0c8', label: 'phenolphthalein, faint pink' },
  },
  {
    match: /litmus/i,
    colour: (ph) =>
      ph < 5
        ? { color: '#d94d4d', label: 'litmus, red' }
        : ph > 8
        ? { color: '#4d6fd9', label: 'litmus, blue' }
        : { color: '#8e6cc2', label: 'litmus, purple' },
  },
]

// Coloured solutions, by what they contain. Order matters: first match wins.
const SOLUTION_COLOURS: Array<{ match: RegExp; color: string; label: string }> = [
  { match: /permanganate|KMnO4/i, color: '#6a1b9a', label: 'permanganate, purple' },
  { match: /copper|CuSO4/i, color: '#2e86c1', label: 'copper(II), blue' },
  { match: /ferrous|iron\s*\(?ii\)?|FeSO4/i, color: '#8fbf8f', label: 'iron(II), pale green' },
  { match: /ferric|iron\s*\(?iii\)?|FeCl3/i, color: '#c9872b', label: 'iron(III), yellow-brown' },
  { match: /iodine|I2/i, color: '#8b4513', label: 'iodine, brown' },
  { match: /dichromate|Cr2O7/i, color: '#e67e22', label: 'dichromate, orange' },
  { match: /nickel/i, color: '#5fb57a', label: 'nickel, green' },
  { match: /cobalt/i, color: '#d6537c', label: 'cobalt, pink' },
]

export function liquidAppearance(item: any): LiquidAppearance | null {
  const contents = Number(item?.contents ?? item?.volume ?? 0)
  if (!(contents > 0)) return null

  const ph = item?.phValue != null && Number.isFinite(Number(item.phValue)) ? Number(item.phValue) : null
  const haystack = [item?.name, item?.displayName, item?.formula, item?.substanceName]
    .filter(Boolean)
    .join(' ')

  // Gas evolved? From the reaction engine's products, or its type hint.
  const products = item?.reactionResult?.products
    ? Object.keys(item.reactionResult.products)
    : []
  const bubbling =
    item?.reactionResult?.reaction_type === 'gas_evolution' ||
    products.some((p) => GAS_FORMULAE.has(String(p).replace(/\(.*\)/, '')))

  // An indicator present in the mixture takes priority: that is the whole
  // point of adding one.
  if (ph != null) {
    for (const ind of INDICATORS) {
      if (ind.match.test(haystack)) {
        const c = ind.colour(ph)
        return { color: c.color, opacity: 0.55, bubbling, label: c.label }
      }
    }
  }

  for (const sol of SOLUTION_COLOURS) {
    if (sol.match.test(haystack)) {
      return { color: sol.color, opacity: 0.5, bubbling, label: sol.label }
    }
  }

  // Colourless aqueous solutions: a faint water tint so the level is visible.
  return { color: '#9ccfe6', opacity: 0.35, bubbling, label: 'colourless solution' }
}

// ---------------------------------------------------------------------------

interface Props {
  item: any
  size: number // the vessel image is size x size px
}

export default function LiquidLayer({ item, size }: Props) {
  const appearance = liquidAppearance(item)
  const capacity = Number(item?.capacity ?? 0)
  const contents = Number(item?.contents ?? item?.volume ?? 0)

  // Fill fraction of the vessel. Without a known capacity, show a modest
  // level so the student still sees that something is in there.
  const fraction =
    capacity > 0 ? Math.min(1, Math.max(0, contents / capacity)) : contents > 0 ? 0.35 : 0

  // Animate the level: start from the previous fraction and ease to the new
  // one, so a pour visibly rises rather than snapping.
  const [shownFraction, setShownFraction] = useState(fraction)
  const prev = useRef(fraction)
  useEffect(() => {
    prev.current = shownFraction
    const id = requestAnimationFrame(() => setShownFraction(fraction))
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fraction])

  if (!appearance || fraction <= 0) return null

  // The drawable interior of a typical vessel SVG: inset from the edges and
  // from the top (neck / rim). Tuned to read well across the beaker, flask,
  // cylinder and conical flask artwork in the catalogue.
  const interiorLeft = size * 0.3
  const interiorWidth = size * 0.4
  const interiorBottom = size * 0.08
  const interiorHeight = size * 0.7
  const liquidHeight = interiorHeight * shownFraction

  const bubbles = appearance.bubbling ? [0, 1, 2, 3, 4, 5] : []

  return (
    <div
      aria-hidden
      title={appearance.label}
      style={{
        position: 'absolute',
        left: interiorLeft,
        bottom: interiorBottom,
        width: interiorWidth,
        height: interiorHeight,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* the liquid */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: liquidHeight,
          background: appearance.color,
          opacity: appearance.opacity,
          transition: 'height 900ms cubic-bezier(0.22, 1, 0.36, 1)',
          borderRadius: '0 0 18% 18% / 0 0 12% 12%',
        }}
      />
      {/* meniscus highlight */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: liquidHeight - 2,
          height: 3,
          background: 'rgba(255,255,255,0.55)',
          transition: 'bottom 900ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {/* effervescence */}
      {bubbles.map((i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            bottom: 2,
            left: `${12 + i * 14}%`,
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.9)',
            background: 'rgba(255,255,255,0.35)',
            animation: `chm-bubble ${1.6 + (i % 4) * 0.35}s linear ${i * 0.22}s infinite`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes chm-bubble {
          0%   { transform: translateY(0) scale(0.6); opacity: 0; }
          15%  { opacity: 0.9; }
          100% { transform: translateY(-${Math.max(liquidHeight - 6, 8)}px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
