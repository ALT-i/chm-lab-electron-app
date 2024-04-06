// src/renderer/components/ContextMenu.jsx
import React from 'react'

const ContextMenu = ({ x, y, itemX, itemY, onRemove }) => {
  // Calculate the position relative to the draggable item
  const relativeX = x - itemX
  const relativeY = y - itemY

  return (
    <div
      style={{
        position: 'absolute',
        top: relativeY,
        left: relativeX,
        backgroundColor: 'white',
        border: '1px solid black',
        zIndex: 1000,
      }}
    >
      <ul>
        <li onClick={onRemove}>Remove</li>
      </ul>
    </div>
  )
}

export default ContextMenu
