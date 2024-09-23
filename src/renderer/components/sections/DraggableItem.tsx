import { useDrag } from 'react-dnd'
import TokenizeFormula from '../Formula'
import React, { useState } from 'react'

interface DraggableItemProps {
  item: {
    id: string // Assuming the item now includes an id
    image: string
    name: string
    formula?: string // Assuming formula is optional
  }
  type: 'SUBSTANCE' | 'TOOL'
  onRightClick: (event: React.MouseEvent, item: any) => void
}

function DraggableItem({ item, type, onRightClick }: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: type,
    item: { ...item, id: `${type}-${item.id}`, type: type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      ref={dragRef}
      className="align-top text-center px-1 py-1"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onContextMenu={(e) => {
        e.preventDefault()
        onRightClick(e, item)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        className=" h-32 py-3 px-3"
        style={{ display: 'block' }}
        src={item.image}
        alt={item.name}
      />
      <div
        style={{
          width: isHovered ? 'auto' : '100%', // Adjust width based on hover state
          // whiteSpace: isHovered ? 'nowrap' : 'normal', // Prevent wrapping on hover
        }}
      >
        <p
          className={`text-pretty text-sm ${
            isHovered ? 'font-semibold' : 'truncate'
          }`}
        >
          {item.name}
          {type === 'SUBSTANCE' && <TokenizeFormula formula={item.formula} />}
        </p>
      </div>
    </div>
  )
}

export default DraggableItem
