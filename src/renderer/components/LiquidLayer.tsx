import React, { useEffect, useState } from 'react'
import { liquidAppearance, fillFraction } from '../utils/liquid-appearance'

// ---------------------------------------------------------------------------
// Paints the liquid inside a vessel on the bench.
//
// Until now a merge changed a caption and a pH badge and nothing else: the
// vessel image stayed an empty line drawing. A real practical teaches through
// the eyes that something happened -- the level rises, an indicator turns,
// a carbonate fizzes. The chemistry-to-colour rules live in
// utils/liquid-appearance.ts so they can be tested; this file only draws.
//
// Placement: the apparatus artwork is not bottom-aligned in its box (a
// beaker's drawn body may end 65% of the way down), and its body is a
// near-white fill rather than transparent. So the vessel's real drawn extent
// is measured once per image from its opaque pixels, the liquid is placed
// inside that, and it is drawn in front at partial opacity so the glass
// outline still shows through it.
// ---------------------------------------------------------------------------

interface Bounds {
  top: number // fraction of image height
  bottom: number
  left: number // fraction of image width
  right: number
}

// Used when the image cannot be measured (not yet loaded, cross-origin
// without CORS, or a broken image showing the fallback).
const FALLBACK_BOUNDS: Bounds = { top: 0.15, bottom: 0.92, left: 0.3, right: 0.7 }

const boundsCache = new Map<string, Bounds | null>()
const pending = new Map<string, Promise<Bounds | null>>()

function measureBounds(src: string): Promise<Bounds | null> {
  if (boundsCache.has(src)) return Promise.resolve(boundsCache.get(src) ?? null)
  if (pending.has(src)) return pending.get(src)!

  const p = new Promise<Bounds | null>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const w = 96
        const h = 96
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0, w, h)
        const data = ctx.getImageData(0, 0, w, h).data
        let top = h, bottom = -1, left = w, right = -1
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4
            const a = data[i + 3]
            const r = data[i], g = data[i + 1], b = data[i + 2]
            // Count anything visibly drawn: ink, or the pale glass fill.
            const isInk = a > 40 && (r + g + b) / 3 < 235
            if (isInk) {
              if (y < top) top = y
              if (y > bottom) bottom = y
              if (x < left) left = x
              if (x > right) right = x
            }
          }
        }
        if (bottom < 0 || right < 0) return resolve(null)
        resolve({ top: top / h, bottom: (bottom + 1) / h, left: left / w, right: (right + 1) / w })
      } catch {
        resolve(null) // tainted canvas or decode failure
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  }).then((b) => {
    boundsCache.set(src, b)
    pending.delete(src)
    return b
  })
  pending.set(src, p)
  return p
}

function useVesselBounds(src: string | undefined): Bounds {
  const [bounds, setBounds] = useState<Bounds>(() => (src && boundsCache.get(src)) || FALLBACK_BOUNDS)
  useEffect(() => {
    let alive = true
    if (!src) return
    const cached = boundsCache.get(src)
    if (cached) { setBounds(cached); return }
    measureBounds(src).then((b) => { if (alive && b) setBounds(b) })
    return () => { alive = false }
  }, [src])
  return bounds
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
  const bounds = useVesselBounds(item?.image)
  const fraction = fillFraction(contents, capacity)

  // Ease the level to its new height so a pour visibly rises.
  const [shownFraction, setShownFraction] = useState(fraction)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShownFraction(fraction))
    return () => cancelAnimationFrame(id)
  }, [fraction])

  if (!appearance || fraction <= 0) return null

  // The vessel's drawn extent, inset so the liquid sits inside the glass
  // walls and below the rim / neck.
  const vesselTop = size * bounds.top
  const vesselBottom = size * bounds.bottom
  const vesselLeft = size * bounds.left
  const vesselRight = size * bounds.right
  const vesselW = vesselRight - vesselLeft
  const vesselH = vesselBottom - vesselTop

  const left = vesselLeft + vesselW * 0.14
  const width = vesselW * 0.72
  const bottomInset = vesselH * 0.05
  const interiorH = vesselH * 0.78
  const liquidH = interiorH * shownFraction

  const bubbles = appearance.bubbling ? [0, 1, 2, 3, 4, 5] : []

  return (
    <div
      aria-hidden
      title={appearance.label}
      style={{
        position: 'absolute',
        left,
        top: vesselBottom - bottomInset - interiorH,
        width,
        height: interiorH,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 2, // in front of the glass; the outline shows through
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: liquidH,
          background: appearance.color,
          opacity: appearance.opacity,
          transition: 'height 900ms cubic-bezier(0.22, 1, 0.36, 1)',
          borderRadius: '0 0 22% 22% / 0 0 14% 14%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: Math.max(0, liquidH - 2),
          height: 2,
          background: 'rgba(255,255,255,0.7)',
          transition: 'bottom 900ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
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
            border: '1px solid rgba(255,255,255,0.95)',
            background: 'rgba(255,255,255,0.4)',
            animation: `chm-bubble ${1.6 + (i % 4) * 0.35}s linear ${i * 0.22}s infinite`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes chm-bubble {
          0%   { transform: translateY(0) scale(0.6); opacity: 0; }
          15%  { opacity: 0.9; }
          100% { transform: translateY(-${Math.max(liquidH - 6, 8)}px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
