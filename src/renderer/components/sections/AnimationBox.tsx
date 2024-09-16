import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDrop } from 'react-dnd'
import TokenizeFormula from '../Formula'
import ContextMenu from '../ContextMenu'
import SimpleModal from '../SimpleModal'
import LiquidGauge from 'react-liquid-gauge'

interface Item {
  type: string
  id: string
  image: string
  position: { x: number; y: number }
}

function AnimationBox(props: any) {
  const { procedure: procedureSteps, panel } = props
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    currentItem: null,
  })
  const [droppedItems, setDroppedItems] = useState([])
  const droppedItemsRef = useRef(droppedItems)
  const [dragging, setDragging] = useState(false)
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [modalContent2, setModalContent2] = useState('')
  const [modalTitle, setModalTitle] = useState('')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isExperimentCompleted, setIsExperimentCompleted] = useState(false)

  const backgroundImages = [
    'url("./real_chemLab_bg.jpg")',
    'url("./real_chemLab_bg2.jpg")',
    'url("./real_chemLab_bg3.jpg")',
  ]
  const svgOverlay = 'url("./labbench_bg.svg")' // Path to your SVG overlay

  const [randomBackgroundImage, setRandomBackgroundImage] = useState('')

  useEffect(() => {
    const selectedImage =
      backgroundImages[Math.floor(Math.random() * backgroundImages.length)]
    setRandomBackgroundImage(`${svgOverlay}, ${selectedImage}`)
  }, [])

  useEffect(() => {
    droppedItemsRef.current = droppedItems
  }, [droppedItems])

  const showModal = useCallback((title, message1, message2 = '') => {
    setModalTitle(title)
    setModalContent(message1)
    setModalContent2(message2)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleVolumeChange = (volume) => {
    // Logic to handle volume change and simulate pouring
    console.log('Volume to add:', volume)
    // Use react-liquid-gauge to simulate pouring
    // Update the state or perform any other necessary actions
  }

  const handleRightClick = (event, item) => {
    event.preventDefault()
    const itemPosition = item.position
    setContextMenu({
      visible: true,
      x: event.pageX,
      y: event.pageY,
      currentItem: item,
    })
  }

  const handleClickOutside = (event) => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false })
    }
  }

  useEffect(() => {
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu.visible])

  const [, dropRef] = useDrop(() => ({
    accept: ['SUBSTANCE', 'TOOL'],
    drop: (item: Item, monitor) => {
      const boxRect = document
        .querySelector('.animation-box')
        ?.getBoundingClientRect()
      if (!boxRect) return

      const delta = monitor.getClientOffset()
      const initialPosition = delta
        ? { x: delta.x, y: delta.y }
        : { x: 0, y: 0 }

      let newX
      const minY = 50 // Set your minimum Y value here
      const maxY = boxRect.height - 250 // Assuming item height is 250px
      let centerY = initialPosition.y

      if (centerY < minY) {
        centerY = minY
      } else if (centerY > maxY) {
        centerY = maxY
      }

      if (droppedItemsRef.current.length === 0) {
        newX = boxRect.width / 2 - 50 // Assuming item width is 100px
      } else {
        const lastItem =
          droppedItemsRef.current[droppedItemsRef.current.length - 1]
        newX = lastItem.position.x + 110 // 100px item width + 10px gap
      }

      // Ensure newX is within the bounds of the AnimationBox
      const minX = 0
      const maxX = boxRect.width - 100 // Assuming item width is 100px
      if (newX < minX) {
        newX = minX
      } else if (newX > maxX) {
        newX = maxX
      }

      const newItem = {
        ...item,
        position: { x: newX, y: centerY },
      }

      console.log('Dropped item:', newItem)

      setDroppedItems((currentItems) => [...currentItems, newItem])
      // Use a callback to log the updated state
      // setDroppedItems((currentItems: DroppedItem[]) => {
      //   const updatedItems = [...currentItems, newItem]
      //   console.log('Updated dropped items:', updatedItems)
      //   return updatedItems
      // })
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

      const boxRect = document
        .querySelector('.animation-box')
        ?.getBoundingClientRect()

      newX = Math.min(Math.max(newX, 0), boxRect.width - 100) // Assuming item width is 100px
      newY = Math.min(Math.max(newY, 0), boxRect.height - 100) // Assuming item height is 100px

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
    setIsCalculating(true)
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
        }
        return [...filteredItems, mergedItem]
      })
      setIsCalculating(false)
    }, 1000)
  }, [])

  const endDrag = useCallback(() => {
    setDragging(false)
    setCurrentItem(null)
    droppedItems.forEach((item) => {
      if (item.id !== currentItem.id) {
        if (doItemsOverlap(currentItem, item)) {
          console.log('OVERLAPP!!!', item?.name, currentItem?.name)
          const currentStep = procedureSteps.steps[currentStepIndex]
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
            if (currentStepIndex === procedureSteps.steps.length - 1) {
              setIsCalculating(false)
              setCurrentStepIndex(currentStepIndex + 1)
              setIsExperimentCompleted(true)
              showModal(
                `Experiment Complete!`,
                `You've successfully completed the experiment and have achieved the final result of ${item?.name}. You can clear the
                workbench to restart the experiment!`
              )
            } else {
              setCurrentStepIndex(currentStepIndex + 1)
            }
          } else {
            showModal(
              `Invalid Next Step!`,
              `${currentStep?.description}`,
              `Cannot combine ${currentItem?.name} and ${item?.name}. This is not a valid next step in the experiment!`
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
      width: 100, // Assuming item width is 100px
      height: 100, // Assuming item height is 100px
    }
    const rect2 = {
      x: item2.position.x,
      y: item2.position.y,
      width: 100, // Assuming item width is 100px
      height: 100, // Assuming item height is 100px
    }

    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.x + rect2.width < rect1.x ||
      rect2.y + rect2.height < rect1.y
    )
  }

  function isValidMergeForStep(currentItem, item, currentStep) {
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

    return !!mergeRule
  }

  function generateUniqueId() {
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
      className={`animation-box  ${
        panel ? 'w-3/5 basis-3/5' : 'w-4/5 basis-4/5'
      } !ml-2 !mr-2 flex`}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: randomBackgroundImage,
          backgroundPosition: '50% 108%', //'bottom center',
          backgroundSize: '25rem, cover',
          backgroundRepeat: 'no-repeat, no-repeat',
          opacity: 0.5,
          zIndex: -1,
        }}
      ></div>
      <div
        className="absolute top-2 left-2 bg-white p-4 border rounded shadow-lg"
        style={{ maxHeight: '80%', overflowY: 'auto', width: '25%' }}
      >
        <h4 className="font-bold text-lg mb-2">Experiment Steps</h4>
        <ul>
          {procedureSteps?.steps?.map((step, index) => (
            <li
              key={index}
              className={`p-2 rounded-sm ${
                currentStepIndex > index
                  ? 'text-green-500 shadow-inner line-through italic'
                  : 'shadow-md'
              }`}
            >
              {currentStepIndex > index ? '✔️ ' : '🔘'}
              {step?.description}
            </li>
          ))}
        </ul>
      </div>
      {isCalculating && (
        <div className="absolute z-10 flex justify-center items-center w-full h-full">
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
      {droppedItems.length > 0 ? (
        droppedItems.map((item, index) => (
          <div
            key={index}
            onMouseDown={(e) => {
              if (e.button === 2) {
                handleRightClick(e, item)
              } else {
                startDrag(item, e)
              }
            }}
            onContextMenu={(e) => e.preventDefault()}
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
            </p>
          </div>
        ))
      ) : (
        <p className="text-center align-middle my-52 mx-24 shadow-inner bg-gray-200">
          Drag substances and apparatus here to start experimenting...
        </p>
      )}
      <div className="absolute top-2 right-2 border">
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
      <SimpleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        nextStep={modalContent}
        warning={modalContent2}
      />
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          itemX={contextMenu.currentItem.position.x}
          itemY={contextMenu.currentItem.position.y}
          onRemove={() => {
            setDroppedItems((currentItems) =>
              currentItems.filter((item) => item.id !== contextMenu.currentItem.id)
            )
            setContextMenu({ ...contextMenu, visible: false })
          }}
          onVolumeChange={handleVolumeChange}
          itemType={contextMenu.currentItem.type}
        />
      )}
      {/* <LiquidGauge
        value={50} // Example value, replace with actual state
        width={200}
        height={200}
        // Add other necessary props
      /> */}
    </div>
  )
}

export default AnimationBox
