import React, { useState, useEffect } from 'react'
import BeakerGauge from './BeakerGauge'
import { formatNumber, toCm3 } from '../utils/lab-measurements'

const VolumeInputDialog = ({
  isOpen,
  onClose,
  onConfirm,
  maxVolume,
  recommendedVolume,
  capacity = null as number | null,
  contents = 0,
}) => {
  const [volume, setVolume] = useState(0)
  const [unit, setUnit] = useState('cm³')

  useEffect(() => {
    if (isOpen) {
      setVolume(0)
      setUnit('cm³')
    }
  }, [isOpen])

  // maxVolume is in cm³; clamp the typed value in whichever unit is selected
  const clampToMax = (value: number, selectedUnit: string) =>
    Math.min(value, maxVolume / toCm3(1, selectedUnit))

  const handleConfirm = () => {
    onConfirm(volume, unit)
    onClose()
  }

  if (!isOpen) return null

  const volumeCm3 = toCm3(volume, unit)
  const isOverRecommended =
    recommendedVolume != null && volumeCm3 > recommendedVolume

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-bold">Enter Volume</h2>
        <div className="flex items-center">
          <div className="mr-4">
            <BeakerGauge
              volume={Number.isFinite(volumeCm3) ? volumeCm3 : 0}
              contents={contents}
              maxVolume={capacity ?? maxVolume}
              unit="cm³"
              isOverRecommended={isOverRecommended}
            />
          </div>
          <div>
            {capacity != null && (
              <p className="text-sm text-gray-600 mb-2">
                Container: {formatNumber(contents)} of {formatNumber(capacity)}{' '}
                cm³ filled
              </p>
            )}
            <input
              type="number"
              value={volume}
              onChange={(e) =>
                setVolume(clampToMax(parseFloat(e.target.value), unit))
              }
              placeholder="Volume to add"
              className="border p-2 w-full"
            />
            <select
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value)
                setVolume((current) => clampToMax(current, e.target.value))
              }}
              className="border p-2 mt-2 w-full"
            >
              <option value="cm³">cm³</option>
              <option value="dm³">dm³</option>
            </select>
            {isOverRecommended && (
              <p className="text-red-500 text-sm mt-2">
                Warning: Volume exceeds recommended amount (
                {formatNumber(recommendedVolume)} cm³)
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleConfirm}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Apply
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default VolumeInputDialog
