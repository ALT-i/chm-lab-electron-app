import React, { useState, useEffect } from 'react'
import BeakerGauge from './BeakerGauge'

const VolumeInputDialog = ({
  isOpen,
  onClose,
  onConfirm,
  maxVolume,
  recommendedVolume,
}) => {
  const [volume, setVolume] = useState(0)
  const [unit, setUnit] = useState('cm³')

  useEffect(() => {
    if (isOpen) {
      setVolume(0)
      setUnit('cm³')
    }
  }, [isOpen])

  const handleConfirm = () => {
    onConfirm(volume, unit)
    onClose()
  }

  if (!isOpen) return null

  const isOverRecommended = volume > recommendedVolume

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg">
        <h2 className="text-lg font-bold">Enter Volume</h2>
        <div className="flex items-center">
          <div className="mr-4">
            <BeakerGauge
              volume={volume}
              maxVolume={maxVolume}
              unit={unit}
              isOverRecommended={isOverRecommended}
            />
          </div>
          <div>
            <input
              type="number"
              value={volume}
              onChange={(e) =>
                setVolume(Math.min(parseFloat(e.target.value), maxVolume))
              }
              placeholder="Volume to add"
              className="border p-2 w-full"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="border p-2 mt-2 w-full"
            >
              <option value="cm³">cm³</option>
              <option value="dm³">dm³</option>
            </select>
            {isOverRecommended && (
              <p className="text-red-500 text-sm mt-2">
                Warning: Volume exceeds recommended amount ({recommendedVolume}{' '}
                {unit})
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
