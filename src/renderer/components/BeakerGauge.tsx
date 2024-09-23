import React, { useEffect, useRef } from 'react'

const BeakerGauge = ({ volume, maxVolume, unit, isOverRecommended }) => {
  const fillPercentage = (volume / maxVolume) * 100
  const fillHeight = 120 * (fillPercentage / 100)
  const waveColor = isOverRecommended ? '#ff5555' : '#178BCA'
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId

    const drawWave = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = waveColor

      const waveHeight = 3
      const frequency = 0.1
      const amplitude = 1

      ctx.beginPath()
      ctx.moveTo(0, canvas.height)

      for (let x = 0; x <= canvas.width; x++) {
        const y = Math.sin(x * frequency + time / 200) * amplitude
        ctx.lineTo(x, canvas.height - fillHeight + y - waveHeight)
      }

      ctx.lineTo(canvas.width, canvas.height)
      ctx.closePath()
      ctx.fill()

      animationFrameId = requestAnimationFrame(drawWave)
    }

    drawWave(0)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [fillHeight, waveColor])

  return (
    <svg width="80" height="160" viewBox="0 0 80 160">
      <defs>
        <mask id="cylinderMask">
          <path
            d="M20 20 L20 140 Q20 160 40 160 Q60 160 60 140 L60 20 Q60 0 40 0 Q20 0 20 20 Z"
            fill="white"
          />
        </mask>
      </defs>

      {/* Liquid */}
      <foreignObject x="20" y="20" width="100" height="150" mask="url(#cylinderMask)">
        <canvas ref={canvasRef} width="100" height="140" style={{ display: 'block' }} />
      </foreignObject>

      {/* Cylinder outline */}
      <path
        d="M20 20 L20 140 Q20 160 40 160 Q60 160 60 140 L60 20 Q60 0 40 0 Q20 0 20 20 Z"
        fill="none"
        stroke="black"
        strokeWidth="2"
      />

      {/* Measurement lines */}
      <g stroke="black" strokeWidth="1">
        <line x1="15" y1="40" x2="25" y2="40" />
        <line x1="15" y1="80" x2="25" y2="80" />
        <line x1="15" y1="120" x2="25" y2="120" />
      </g>

      {/* Text */}
      <text x="40" y="80" textAnchor="middle" fill="#444" fontFamily="Arial">
        <tspan fontSize="14">{Math.round(volume)}</tspan>
        <tspan fontSize="8" dy="10">{unit}</tspan>
      </text>
    </svg>
  )
}

export default BeakerGauge
