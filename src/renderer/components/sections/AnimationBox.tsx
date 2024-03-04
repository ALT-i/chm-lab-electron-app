import React, { useCallback, useEffect } from 'react'
import { useState } from 'react'
import { useDrop } from 'react-dnd'

interface Item {
  type: string
  id: string
  image: string
  position: { x: number; y: number }
}

function AnimationBox() {
  // State to keep track of dropped items
  const [droppedItems, setDroppedItems] = useState([])
  const [dragging, setDragging] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const [, dropRef] = useDrop(() => ({
    accept: ['SUBSTANCE', 'TOOL'], // Accept both substances and tools
    drop: (item: Item, monitor) => {
      console.log('Dropped item:', item)
      const delta = monitor.getClientOffset()
      const initialPosition = delta
        ? { x: delta.x, y: delta.y }
        : { x: 0, y: 0 }
      setDroppedItems((currentItems) => [
        ...currentItems,
        { ...item, position: initialPosition },
      ])
      // Handle the dropped item here (e.g., add it to the animation box)
    },
  }))

  const startDrag = useCallback((item, event) => {
    setDragging(true)
    setCurrentItem(item)
    setOffset({
      x: event.clientX - item.position.x,
      y: event.clientY - item.position.y,
    })
  }, [])

  const onDrag = useCallback(
    (event: { clientX: number; clientY: number }) => {
      if (!dragging || !currentItem) return
      let newX = event.clientX - offset.x
      let newY = event.clientY - offset.y

      // Get the bounding rectangle of the animation box
      const boxRect = document
        .querySelector('.animation-box')
        .getBoundingClientRect()

      newX = Math.min(Math.max(newX, 0), boxRect.width - 162) // Assuming the draggable item is 50px wide
      newY = Math.min(Math.max(newY, 0), boxRect.height - 162) // Assuming the draggable item is 50px tall

      setDroppedItems((items) =>
        items.map((item) =>
          item.id === currentItem.id
            ? { ...item, position: { x: newX, y: newY } }
            : item
        )
      )
    },
    [dragging, currentItem, offset]
  )

  const endDrag = useCallback(() => {
    setDragging(false)
    setCurrentItem(null)
    // Check for overlaps with items of the same type
    droppedItems.forEach((item) => {
      if (item.id !== currentItem.id && item.type === currentItem.type) {
        if (doItemsOverlap(currentItem, item)) {
          console.log("OVERLAPP!!!")
          // Perform merge or action based on your requirements
          mergeItems(currentItem, item)
          // Or perform another action
          // performAction(currentItem, item);
        }
      }
    })
  }, [dragging, currentItem, droppedItems])

  function doItemsOverlap(item1, item2) {
    const rect1 = {
      x: item1.position.x,
      y: item1.position.y,
      width: 50,
      height: 50,
    } // Assuming fixed size for simplicity
    const rect2 = {
      x: item2.position.x,
      y: item2.position.y,
      width: 50,
      height: 50,
    }

    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.x + rect2.width < rect1.x ||
      rect2.y + rect2.height < rect1.y
    )
  }

  function generateUniqueId() {
    // Generate a random number and concatenate it with a timestamp to create a unique ID
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
  }

  function mergeItems(item1, item2) {
    setDroppedItems((currentItems) => {
      const filteredItems = currentItems.filter(
        (item) => item.id !== item1.id && item.id !== item2.id
      )
      const mergedItem = {
        id: generateUniqueId(), // Generate a unique ID for the merged item
        type: item1.type, // Assuming item1 and item2 have the same type
        position: {
          x: (item1.position.x + item2.position.x) / 2,
          y: (item1.position.y + item2.position.y) / 2,
        },
        image: item1.image,
        // Add any other properties needed for the merged item
      }
      return [...filteredItems, mergedItem]
    })
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onDrag)
      window.addEventListener('mouseup', endDrag)
    } else {
      window.removeEventListener('mousemove', onDrag)
      window.removeEventListener('mouseup', endDrag)
    }

    return () => {
      window.removeEventListener('mousemove', onDrag)
      window.removeEventListener('mouseup', endDrag)
    }
  }, [dragging, onDrag, endDrag])

  return (
    <div
      ref={dropRef}
      className="animation-box lesson-instruction"
      style={{
        position: 'relative',
        // overflow: 'hidden',
        height: '32em',
      }}
    >
      {/* Animation content */}
      {droppedItems ? (
        droppedItems.map((item, index) => (
          <div
            key={index}
            onMouseDown={(e) => startDrag(item, e)}
            style={{
              position: 'absolute',
              left: item.position.x,
              top: item.position.y,
              cursor: 'move',
              textAlign: 'justify',
              alignItems: 'center',
            }}
          >
            <img
              src={item.image}
              alt=""
              style={{ width: '10em', height: '10em', display: 'block' }}
            />
            <p>{item.name}</p>
          </div>
          // <div key={index}>
          //   <img
          //     src={item?.image}
          //     style={{ maxHeight: '100%', height: '10em', cursor: 'move' }}
          //   />
          //   {/* <p>{item.name}</p> */}
          // </div>
        ))
      ) : (
        <p>Drag substances and apparatus here to start experimenting...</p>
      )}
      <button
        onClick={() => setDroppedItems([])}
        className="absolute top-2 right-2 border border-green-500 text-green-500 bg-gray-100 px-4 py-2 text-lg rounded cursor-pointer shadow transition-all hover:bg-green-500 hover:text-white hover:shadow-lg"
      >
        Clear WorkBench
      </button>
    </div>
  )
}

export default AnimationBox
