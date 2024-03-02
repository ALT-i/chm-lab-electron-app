import { useState } from 'react'
import { useDrop } from 'react-dnd'

interface Item {
  type: string
  id: string
}

function AnimationBox() {
  // State to keep track of dropped items
  const [droppedItems, setDroppedItems] = useState([])

  const [, dropRef] = useDrop(() => ({
    accept: ['SUBSTANCE', 'TOOL'], // Accept both substances and tools
    drop: (item: Item, monitor) => {
      console.log('Dropped item:', item)
      setDroppedItems((currentItems: Item[]) => [...currentItems, item])
      // Handle the dropped item here (e.g., add it to the animation box)
    },
  }))
  return (
    <div ref={dropRef} className="animation-box">
      {/* Animation content */}
      {droppedItems.map((item, index) => (
        <div key={index}>
          {item.type}: {item.id} {/* Adjust based on your item structure */}
        </div>
      ))}
      <p>Drag substances and apparatus here to start experimenting...</p>
    </div>
  )
}

export default AnimationBox
