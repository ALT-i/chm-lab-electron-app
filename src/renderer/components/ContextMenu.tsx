// src/renderer/components/ContextMenu.jsx
import React, { useState } from 'react'

const ContextMenu = ({ x, y, itemX, itemY, onRemove, onVolumeChange, itemType }) => {
  const [volume, setVolume] = useState(0)

  const handleVolumeChange = (e) => {
    setVolume(e.target.value)
  }

  const handleApply = () => {
    onVolumeChange(volume)
  }

  const relativeX = x - itemX
  const relativeY = y - itemY

  return (
    <div
      style={{
        position: 'absolute',
        top: relativeY,
        left: relativeX + 110, // Adjust to position beside the item
        backgroundColor: 'white',
        border: '1px solid black',
        zIndex: 1000, // Ensure it overlays above other items
        padding: '10px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        {itemType === 'SUBSTANCE' && (
          <li style={{ marginBottom: '10px' }}>
            <input
              type="number"
              value={volume}
              onChange={handleVolumeChange}
              placeholder="Volume to add"
              style={{ width: '100%' }}
            />
            <button
              onClick={handleApply}
              style={{ marginTop: '5px', width: '100%' }}
            >
              Apply
            </button>
          </li>
        )}
        <li>
          <button onClick={onRemove} style={{ width: '100%' }}>
            Remove
          </button>
        </li>
      </ul>
    </div>
  )
}

export default ContextMenu
