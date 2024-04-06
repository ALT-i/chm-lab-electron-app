import React, { useCallback, useEffect } from 'react'
import { useState } from 'react'
import { useDrop } from 'react-dnd'
import TokenizeFormula from '../Formula'
import ContextMenu from '../ContextMenu'
import SimpleModal from '../SimpleModal'

interface Item {
  type: string
  id: string
  image: string
  position: { x: number; y: number }
}

function AnimationBox(props: any) {
  const procedureSteps = props.procedure
  // console.log(procedureSteps)
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    currentItem: null,
  })
  const [droppedItems, setDroppedItems] = useState([])
  const [dragging, setDragging] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [modalTitle, setModalTitle] = useState('')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isExperimentCompleted, setIsExperimentCompleted] = useState(false)

  const showModal = useCallback((title, message) => {
    setModalTitle(title)
    setModalContent(message)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const [, dropRef] = useDrop(() => ({
    accept: ['SUBSTANCE', 'TOOL'], // Accept both substances and tools
    drop: (item: Item, monitor) => {
      console.log('Dropped item:', item)
      const delta = monitor.getClientOffset()
      const initialPosition = delta
        ? { x: delta.x, y: delta.y }
        : { x: 0, y: 0 }
      // Check if the item being dropped already exists based on ID
      if (!droppedItems.some((droppedItem) => droppedItem.id === item.id)) {
        setDroppedItems((currentItems) => [
          ...currentItems,
          { ...item, position: initialPosition },
        ])
      }
      // Handle the dropped item here (e.g., add it to the animation box)
    },
  }))

  const handleRightClick = (event, item) => {
    event.preventDefault() // Prevent the default context menu from opening
    const itemPosition = item.position // Assuming `item.position` contains the { x, y } coordinates of the item
    setContextMenu({
      visible: true,
      x: event.pageX - itemPosition.x, // Adjust based on item's position
      y: event.pageY - itemPosition.y, // Adjust based on item's position
      currentItem: item,
    })
  }

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
        ?.getBoundingClientRect()

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

  const mergeItems = useCallback((item1, item2, mergeRule) => {
    setIsCalculating(true) // Start calculating
    console.log('Merging', item1, item2)
    setTimeout(() => {
      setDroppedItems((currentItems) => {
        const filteredItems = currentItems.filter(
          (item) => item.id !== item1.id && item.id !== item2.id
        )
        const mergedItem = {
          id: `merged-${Date.now()}`,
          name: mergeRule.result.name,
          type: item1.type,
          position: {
            x: (item1.position.x + item2.position.x) / 2,
            y: (item1.position.y + item2.position.y) / 2,
          },
          image: mergeRule.result.image,
          // Add any other necessary properties for the merged item
        }
        return [...filteredItems, mergedItem]
      })
      setIsCalculating(false)
    }, 1000)
  }, [])

  const endDrag = useCallback(() => {
    setDragging(false)
    setCurrentItem(null)
    // Check for overlaps with items   //of the same type
    droppedItems.forEach((item) => {
      if (item.id !== currentItem.id) {
        // && item.type === currentItem.type
        if (doItemsOverlap(currentItem, item)) {
          console.log('OVERLAPP!!!', item?.name, currentItem?.name)
          const currentStep = procedureSteps.steps[currentStepIndex]
          // Find the relevant merge rule
          // const currentStep = procedureSteps.steps.find(
          //   (step) =>
          //     step.apparatus.some((app) => app.name === currentItem.name) ||
          //     step.substances.some((sub) => sub.name === currentItem.name)
          // )
          console.log(currentStep, currentStepIndex)
          if (isValidMergeForStep(currentItem, item, currentStep)) {
            const mergeRule = currentStep.mergeRules?.find((rule) => {
              return (
                (rule.with.substance === item.name ||
                  rule.with.apparatus === item.name) &&
                (rule.with.substance === currentItem.name ||
                  rule.with.apparatus === currentItem.name)
              )
            })

            console.log('Merge rule found:', mergeRule)
            setTimeout(() => mergeItems(currentItem, item, mergeRule), 500)
            // mergeItems(currentItem, item)
            // Optionally, move to the next step
            if (currentStepIndex === procedureSteps.steps.length - 1) {
              setIsCalculating(false)
              setIsExperimentCompleted(true)
              showModal(
                `Current step: ${currentStep?.description}`,
                `You've successfully completed the experiment. You can clear the
                workbench to restart the experiment!`
              )
            } else {
              setCurrentStepIndex(currentStepIndex + 1)
            }
          } else {
            showModal(
              `Current step: ${currentStep?.description}`,
              `Cannot combine ${currentItem.name} and ${item.name}. This is not a valid next step in the experiment!`
            )
          }
        } else {
          console.log('No overlap between', currentItem.name, 'and', item.name)
        }
      }
    })
  }, [dragging, currentItem, droppedItems, mergeItems, showModal])

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

  function isValidMergeForStep(currentItem, item, currentStep) {
    // Check if there's a merge rule for the current items in the current step
    // const mergeRule = currentStep.mergeRules?.find(
    //   (rule) =>
    //     (rule.with.substance === item.name ||
    //       rule.with.apparatus === item.name) &&
    //     (rule.result.name === currentItem.name ||
    //       rule.result.name === item.name)
    // )

    console.log(currentStep)
    const mergeRule = currentStep.mergeRules?.find((rule) => {
      return (
        (rule.with.substance === item.name ||
          rule.with.apparatus === item.name) &&
        (rule.with.substance === currentItem.name ||
          rule.with.apparatus === currentItem.name)
      )
    })

    console.log(mergeRule)

    return !!mergeRule // Returns true if a merge rule is found, false otherwise
  }

  function generateUniqueId() {
    // Generate a random number and concatenate it with a timestamp to create a unique ID
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
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
      className="w-3/4 animation-box !ml-0 !mr-2 relative flex justify-center items-center overflow-hidden"
      style={{
        position: 'relative',
        overflow: 'hidden',
        // height: '32em',
      }}
    >
      {/* loader */}
      {isCalculating && (
        <div className="absolute z-10 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
          <img
            src="./loading.gif"
            alt="Loading Animation"
            className=" w-32 h-32"
          />
          <p className="absolute z-10 flex justify-center items-center bg-black bg-opacity-20  text-white text-base">
            Computing...
          </p>
        </div>
      )}
      {/* Animation content */}
      {droppedItems.length > 0 ? (
        droppedItems.map((item, index) => (
          <div
            key={index}
            onMouseDown={(e) => {
              if (e.button === 2) {
                // Right click
                handleRightClick(e, item)
              } else {
                startDrag(item, e)
              }
            }}
            onContextMenu={(e) => e.preventDefault()} // Prevent the default context menu
            style={{
              position: 'absolute',
              left: item.position.x,
              top: item.position.y,
              cursor: 'grabbing',
              textAlign: 'justify',
              alignItems: 'center',
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: '10em', height: '10em', display: 'block' }}
            />
            <p className="text-xs truncate text-center">
              {item.name}
              {item?.formula && <TokenizeFormula formula={item?.formula} />}
              {/* <TokenizeFormula formula={item.formula} /> */}
            </p>
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
        <p className="text-center align-middle my-52 mx-24 shadow-inner bg-gray-200">
          Drag substances and apparatus here to start experimenting...
        </p>
      )}
      <div className="absolute top-2 right-2 border">
        {/* <button
          // onClick={() => setDroppedItems([])}
          className="border-green-500 text-green-500 bg-gray-100 mx-1 px-4 py-2 text-lg rounded cursor-pointer shadow transition-all hover:bg-green-500 hover:text-white hover:shadow-lg"
        >
          ✔️
          <p className="text-xs">Submit</p>
        </button> */}
        <button
          onClick={() => {
            setCurrentStepIndex(0)
            setDroppedItems([])
          }}
          className="border-green-500 text-green-500 bg-gray-100 mx-1 px-4 py-2 text-lg rounded cursor-pointer shadow transition-all hover:bg-green-500 hover:text-white hover:shadow-lg"
        >
          ❌<p className="text-xs">Reset Workbench</p>
        </button>
      </div>
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          itemX={contextMenu.currentItem.position.x}
          itemY={contextMenu.currentItem.position.y}
          onRemove={() => {
            setDroppedItems(
              droppedItems.filter(
                (item) => item.id !== contextMenu.currentItem.id
              )
            )
            setContextMenu({ ...contextMenu, visible: false }) // Hide context menu
          }}
        />
      )}
      <SimpleModal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        <p>{modalContent}</p>
      </SimpleModal>
      {/* {isExperimentCompleted && (
        <SimpleModal
          isOpen={isExperimentCompleted}
          onClose={closeModal}
          // onClose={() => setIsExperimentCompleted(false)}
        >
          <p>
            You've successfully completed the experiment. You can clear the
            workbench to restart the experiment!
          </p>
        </SimpleModal>
      )} */}
    </div>
    //   <div className="w-1/4 h-full fixed">WIUNN</div>
    // </div>
  )
}

export default AnimationBox
