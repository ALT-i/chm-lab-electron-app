import React, { useState, useEffect } from 'react'
import BeakerGauge from './BeakerGauge'
import {
  formatNumber,
  formatWithPrecision,
  getInstrumentStep,
  toCm3,
} from '../utils/lab-measurements'

const VolumeInputDialog = ({
  isOpen,
  onClose,
  onConfirm,
  maxVolume,
  recommendedVolume,
  capacity = null as number | null,
  contents = 0,
  precision = 0.5 as number,
  tolerance = null as number | null,
  instrumentName = '' as string,
  phValue = null as number | null,
}) => {
  const [volume, setVolume] = useState(0)
  const [unit, setUnit] = useState('cm³')

  useEffect(() => {
    if (isOpen) {
      setVolume(0)
      setUnit('cm³')
    }
  }, [isOpen])

  const volumeCm3 = toCm3(volume, unit)
  // maxVolume is in cm³: the space left in the container (or the step's target)
  const exceedsMax = maxVolume != null && volumeCm3 > maxVolume + 1e-6
  const canApply = volume > 0 && !exceedsMax

  const handleConfirm = () => {
    if (!canApply) return
    onConfirm(volume, unit)
    onClose()
  }

  if (!isOpen) return null

  const stepInCm3 = getInstrumentStep(precision)
  const stepInSelectedUnit = stepInCm3 / toCm3(1, unit)
  // Same tolerance the workbench enforces: the step's own tolerance, else instrument precision
  const toleranceCm3 = tolerance ?? precision
  const minAcceptable =
    recommendedVolume != null
      ? Math.max(0, recommendedVolume - toleranceCm3)
      : null
  const maxAcceptable =
    recommendedVolume != null ? recommendedVolume + toleranceCm3 : null
  const isOutsideTolerance =
    recommendedVolume != null &&
    (volumeCm3 < (minAcceptable ?? 0) - 1e-6 ||
      volumeCm3 > (maxAcceptable ?? 0) + 1e-6) &&
    volumeCm3 > 0

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-lg font-bold mb-3">
          Enter Volume{instrumentName ? ` · ${instrumentName}` : ''}
        </h2>
        <div className="flex items-center">
          <div className="mr-4 flex-shrink-0">
            <BeakerGauge
              volume={Number.isFinite(volumeCm3) ? volumeCm3 : 0}
              contents={contents}
              maxVolume={capacity ?? maxVolume}
              unit="cm³"
              isOverRecommended={isOutsideTolerance}
              precision={precision}
              phValue={phValue}
            />
          </div>
          <div className="flex-1">
            {capacity != null && (
              <p className="text-xs text-gray-600 mb-1">
                Container: {formatWithPrecision(contents, precision)} of{' '}
                {formatWithPrecision(capacity, precision)} cm³ filled
              </p>
            )}
            <p className="text-xs text-blue-700 font-medium mb-2">
              Instrument Precision: ±{formatWithPrecision(precision, precision)}{' '}
              cm³ (step: {formatNumber(stepInCm3)} cm³)
            </p>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Volume to add ({unit}):
            </label>
            <input
              type="number"
              step={stepInSelectedUnit}
              min="0"
              max={maxVolume / toCm3(1, unit)}
              value={volume === 0 ? '' : volume}
              onChange={(e) =>
                setVolume(Math.max(0, parseFloat(e.target.value) || 0))
              }
              placeholder={`e.g. ${
                recommendedVolume != null
                  ? formatWithPrecision(
                      recommendedVolume / toCm3(1, unit),
                      precision
                    )
                  : '0'
              }`}
              className="border border-gray-300 rounded p-2 w-full text-sm font-mono focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="border border-gray-300 rounded p-2 mt-2 w-full text-sm bg-white"
            >
              <option value="cm³">cm³ (mL)</option>
              <option value="dm³">dm³ (L)</option>
            </select>
            {exceedsMax && (
              <p className="text-red-600 text-xs font-medium mt-2">
                ⚠️ Overflow: at most {formatWithPrecision(maxVolume, precision)}{' '}
                cm³ more fits in this container.
              </p>
            )}
            {recommendedVolume != null && (
              <div className="mt-2 text-xs">
                <span className="text-gray-600">
                  Target: {formatWithPrecision(recommendedVolume, precision)} cm³{' '}
                  (range:{' '}
                  {formatWithPrecision(minAcceptable!, precision)} –{' '}
                  {formatWithPrecision(maxAcceptable!, precision)} cm³)
                </span>
                {isOutsideTolerance && (
                  <p className="text-amber-600 font-medium mt-1">
                    ⚠️ Current amount (
                    {formatWithPrecision(volumeCm3, precision)} cm³) is outside the
                    target tolerance band.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-5 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canApply}
            className={`px-4 py-2 rounded text-sm font-medium text-white transition ${
              !canApply
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default VolumeInputDialog
