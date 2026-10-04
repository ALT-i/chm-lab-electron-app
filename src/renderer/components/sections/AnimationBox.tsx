import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDrop } from 'react-dnd'
import TokenizeFormula from '../Formula'
import ContextMenu from '../ContextMenu'
import SimpleModal from '../SimpleModal'
import VolumeInputDialog from '../VolumeInputDialog'
import {
  calculateReactionApi,
  formatReactionFeedback,
} from '../../utils/lab-reactions'
import {
  applyReadingError,
  evaluatePourTolerance,
  formatWithPrecision,
  getCapacity,
  getContents,
  getInstrumentPrecision,
  getMergedContents,
  getPourLimits,
  getStepTolerance,
  pickContainer,
  toCm3,
} from '../../utils/lab-measurements'
import {
  calculateSessionGrade,
  MeasurementRecord,
  SessionTelemetry,
  GradeEvaluation,
} from '../../utils/lab-grading'


interface Item {
  type: string
  id: string
  image: string
  position: { x: number; y: number }
  formula?: string
  phValue?: number
  molarity?: number
  name?: string
  displayName?: string
  volume?: number
}

function AnimationBox(props: any) {
  const { procedure: procedureSteps, panel, onExperimentComplete, substances } = props

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    currentItem: null,
  })
  const [droppedItems, setDroppedItems] = useState([])
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
  const [volumeDialogData, setVolumeDialogData] = useState({
    isOpen: false,
    onConfirm: null as any,
    onCancel: null as any,
    maxVolume: null as number | null,
    recommendedVolume: 0 as number | null,
    capacity: null as number | null,
    contents: 0,
    precision: 0.5 as number,
    tolerance: 0.5 as number,
    instrumentName: '' as string,
    phValue: null as number | null,
  })
  const [mergeImageSrc, setMergeImageSrc] = useState('')
  const measurementsRef = useRef<MeasurementRecord[]>([])
  const startTimeRef = useRef<number>(Date.now())

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

  const showModal = useCallback((title, message1, message2 = '') => {
    setModalTitle(title)
    setModalContent(message1)
    setModalContent2(message2)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleVolumeChange = (volume: number) => {
    if (!contextMenu.currentItem) return
    const volNum = Math.max(0, Number(volume) || 0)
    const capacity = getCapacity(contextMenu.currentItem)
    if (capacity !== null && volNum > capacity) {
      setContextMenu((prev) => ({ ...prev, visible: false }))
      showModal(
        'Container Overflow Hazard!',
        `${contextMenu.currentItem.name} has a maximum capacity of ${capacity} cm³.`,
        `Setting it to ${volNum} cm³ would overflow the container. Please enter a smaller volume.`
      )
      return
    }
    setDroppedItems((prevItems) =>
      prevItems.map((it) => {
        if (it.id === contextMenu.currentItem.id) {
          const precision = it.precision || 0.5
          const formattedVol = formatWithPrecision(volNum, precision)
          const baseName = it.name || 'Solution'
          return {
            ...it,
            volume: volNum,
            contents: volNum,
            displayName:
              volNum > 0 ? `${formattedVol} cm³ of ${baseName}` : baseName,
          }
        }
        return it
      })
    )
    setContextMenu((prev) => ({ ...prev, visible: false }))
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
  }, [handleClickOutside])

  const [, dropRef] = useDrop(() => ({
    accept: ['SUBSTANCE', 'TOOL'],
    drop: (item: Item, monitor) => {
      const boxRect = document
        .querySelector('.animation-box')
        ?.getBoundingClientRect()
      if (!boxRect) return

      // Centre the item's image (10em, ~160px) under the cursor, relative to the workbench
      const ITEM_HALF_SIZE = 80
      const pointer = monitor.getClientOffset()
      const dropX = pointer
        ? pointer.x - boxRect.left - ITEM_HALF_SIZE
        : boxRect.width / 2 - ITEM_HALF_SIZE
      const dropY = pointer
        ? pointer.y - boxRect.top - ITEM_HALF_SIZE
        : boxRect.height / 2 - ITEM_HALF_SIZE

      // Same bounds as dragging on the workbench
      const newX = Math.min(Math.max(dropX, 0), boxRect.width - 100)
      const newY = Math.min(Math.max(dropY, 0), boxRect.height - 100)

      const newItem = {
        ...item,
        position: { x: newX, y: newY },
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

  const mergeItems = useCallback(
    async (item1, item2, mergeRule, volume, unit, precision = 0.5) => {
      setIsCalculating(true)
      console.log('Merging', item1, item2)

      let reactionResult = null
      let finalPh = item1?.phValue ?? item2?.phValue ?? null

      if (mergeRule?.reaction) {
        try {
          const reactants = (mergeRule.reaction.reactants || []).map(
            (formula: string) => {
              const matchingItem =
                [item1, item2].find(
                  (it) => it?.formula === formula || it?.name?.includes(formula)
                ) ||
                (substances || []).find(
                  (s: any) => s.formula === formula || s.name?.includes(formula)
                )

              const isPoured =
                matchingItem?.id === item1?.id || matchingItem?.name === item1?.name
              const vol = isPoured ? (volume || 25) : (matchingItem?.volume || 25)
              const mol = matchingItem?.molarity ?? 0.1

              return {
                formula,
                volume: Number(vol),
                molarity: Number(mol),
              }
            }
          )

          const payload = {
            reactants,
            products: mergeRule.reaction.products || [],
            reaction_type: mergeRule.reaction.type || 'neutralization',
          }

          reactionResult = await calculateReactionApi(payload)
          if (reactionResult?.final_ph != null) {
            finalPh = reactionResult.final_ph
          }
        } catch (err) {
          console.warn('Reaction calculation error:', err)
        }
      }

      // The result keeps the container's capacity and accumulates its contents (cm³)
      const container = pickContainer(item1, item2, mergeRule)
      const other = container === item1 ? item2 : item1
      const capacity = getCapacity(container) ?? getCapacity(other)

      const pouredCm3 = toCm3(volume, unit) || 0
      const totalVolume = getMergedContents(container, other, pouredCm3)

      setDroppedItems((currentItems) => {
        const filteredItems = currentItems.filter(
          (item) => item.id !== item1.id && item.id !== item2.id
        )
        const formattedVolume = formatWithPrecision(totalVolume, precision)
        const mergedItem = {
          id: `merged-${Date.now()}`,
          name: mergeRule.result.name, // Keep the original name for matching
          displayName:
            totalVolume > 0
              ? `${formattedVolume} cm³ of ${mergeRule.result.name}`
              : mergeRule.result.name,
          type: item1.type,
          position: {
            x: (item1.position.x + item2.position.x) / 2,
            y: (item1.position.y + item2.position.y) / 2,
          },
          image: mergeRule.result.image,
          volume: totalVolume,
          unit: 'cm³',
          capacity: capacity,
          contents: totalVolume,
          precision: precision,
          phValue: finalPh,
          reactionResult: reactionResult,
        }
        return [...filteredItems, mergedItem]
      })

      setIsCalculating(false)

      if (reactionResult) {
        const feedback = formatReactionFeedback(reactionResult)
        showModal('Chemical Reaction Occurred!', mergeRule.result.name, feedback)
      }
    },
    [substances, showModal]
  )

  const endDrag = useCallback(() => {
    setDragging(false)
    setCurrentItem(null)
    droppedItems.forEach((item) => {
      if (item.id !== currentItem.id) {
        if (doItemsOverlap(currentItem, item)) {
          const currentStep = procedureSteps?.steps?.[currentStepIndex]
          if (!currentStep) return

          if (isValidMergeForStep(currentItem, item, currentStep)) {
            const mergeRule = currentStep.mergeRules?.find((rule) => {
              return (
                (rule.with.substance === item.name ||
                  rule.with.apparatus === item.name) &&
                (rule.with.substance === currentItem.name ||
                  rule.with.apparatus === currentItem.name)
              )
            })

            const isHeatingTool = (it: any) => {
              if (!it?.name) return false
              const n = it.name.toLowerCase()
              return n.includes('burner') || n.includes('bunsen') || n.includes('oven')
            }

            const isHeating = isHeatingTool(currentItem) || isHeatingTool(item)

            if (!isHeating && (currentItem.type === 'SUBSTANCE' || item.type === 'SUBSTANCE')) {
              console.log('SUBSTANCE dropped, opening volume dialog')
              const container = pickContainer(currentItem, item, mergeRule)
              const measuringTool =
                container?.type === 'TOOL'
                  ? container
                  : item.type === 'TOOL'
                  ? item
                  : currentItem
              const precision = getInstrumentPrecision(measuringTool)
              const { maxVolume, recommendedVolume, capacity, contents } =
                getPourLimits(container, mergeRule)
              const tolerance = getStepTolerance(mergeRule, precision)

              setVolumeDialogData({
                isOpen: true,
                onConfirm: (volume, unit) => {
                  const volumeCm3 = toCm3(volume, unit)

                  if (volumeCm3 <= 0) return

                  if (volumeCm3 > maxVolume + 1e-6) {
                    setVolumeDialogData((prev) => ({ ...prev, isOpen: false }))
                    showModal(
                      'Container Overflow Hazard!',
                      `${container?.name} can take at most ${formatWithPrecision(
                        maxVolume,
                        precision
                      )} cm³ more${
                        capacity != null
                          ? ` (capacity ${capacity} cm³, holding ${formatWithPrecision(
                              contents,
                              precision
                            )} cm³)`
                          : ''
                      }.`,
                      `Adding ${formatWithPrecision(
                        volumeCm3,
                        precision
                      )} cm³ would overflow it. Please use a larger vessel or measure a smaller volume.`
                    )
                    return
                  }

                  // Tolerance evaluation against recommended volume if specified
                  if (recommendedVolume != null) {
                    const evalResult = evaluatePourTolerance(
                      volumeCm3,
                      recommendedVolume,
                      tolerance
                    )

                    if (!evalResult.isAcceptable) {
                      setVolumeDialogData((prev) => ({ ...prev, isOpen: false }))
                      showModal(
                        `Measurement Outside Tolerance!`,
                        `${currentStep?.description}`,
                        `You poured ${formatWithPrecision(
                          volume,
                          precision
                        )} ${unit} (${formatWithPrecision(
                          volumeCm3,
                          precision
                        )} cm³), but this step requires ${formatWithPrecision(
                          recommendedVolume,
                          precision
                        )} cm³ (acceptable range: ${formatWithPrecision(
                          evalResult.minAcceptable,
                          precision
                        )} – ${formatWithPrecision(
                          evalResult.maxAcceptable,
                          precision
                        )} cm³, tolerance ±${formatWithPrecision(
                          tolerance,
                          precision
                        )} cm³). Please adjust your measurement and try again.`
                      )
                      return
                    }
                  }

                  // Reading error / meniscus jitter
                  const recordedCm3 = applyReadingError(volumeCm3, precision)
                  const recordedVolume =
                    unit === 'dm³' ? recordedCm3 / 1000 : recordedCm3

                  setVolumeDialogData((prev) => ({ ...prev, isOpen: false }))
                  console.log(
                    'Merging items with recorded volume:',
                    recordedVolume,
                    unit
                  )
                  // Record telemetry measurement
                  const record: MeasurementRecord = {
                    stepIndex: currentStepIndex,
                    description: currentStep?.description,
                    apparatusName: measuringTool?.name || container?.name || '',
                    substanceName: currentItem?.name || item?.name || '',
                    targetVolume:
                      recommendedVolume != null ? recommendedVolume : undefined,
                    inputVolume: volumeCm3,
                    recordedVolume: recordedCm3,
                    unit: unit,
                    precision: precision,
                    tolerance: tolerance,
                    isAcceptable: true,
                    difference:
                      recommendedVolume != null
                        ? recordedCm3 - recommendedVolume
                        : 0,
                    timestamp: Date.now(),
                    phValue: currentItem?.phValue ?? item?.phValue ?? null,
                  }
                  const updatedMeasurements = [
                    ...measurementsRef.current,
                    record,
                  ]
                  measurementsRef.current = updatedMeasurements

                  mergeItems(
                    currentItem,
                    item,
                    mergeRule,
                    recordedVolume,
                    unit,
                    precision
                  )

                  if (currentStepIndex === procedureSteps.steps.length - 1) {
                    const dynamicGrade =
                      calculateSessionGrade(updatedMeasurements)
                    const telemetry: SessionTelemetry = {
                      lessonId: props.lessonId || '',
                      startedAt: startTimeRef.current,
                      completedAt: Date.now(),
                      measurements: updatedMeasurements,
                      totalSteps: procedureSteps.steps.length,
                      completedSteps: procedureSteps.steps.length,
                      grading: dynamicGrade,
                    }
                    setIsCalculating(false)
                    setCurrentStepIndex(currentStepIndex + 1)
                    setIsExperimentCompleted(true)
                    if (onExperimentComplete)
                      onExperimentComplete(true, telemetry, dynamicGrade)
                    showModal(
                      `Experiment Complete!`,
                      `You've successfully completed the experiment! Dynamic Grade: ${dynamicGrade.overallGrade}% (Accuracy: ${dynamicGrade.averageTargetAdherence}%, Precision: ${dynamicGrade.averagePrecisionAdherence}%).`,
                      `Final product: ${
                        item?.name || 'Completed'
                      }. You can now submit your dynamic grade to Moodle!`
                    )
                  } else {
                    setCurrentStepIndex(currentStepIndex + 1)
                  }
                },
                onCancel: () => {
                  console.log('Volume input cancelled')
                  setDroppedItems((currentItems) =>
                    currentItems.filter((item) => item.id !== currentItem.id)
                  )
                  setVolumeDialogData((prev) => ({ ...prev, isOpen: false }))
                },
                maxVolume: maxVolume,
                recommendedVolume: recommendedVolume,
                capacity: capacity,
                contents: contents,
                precision: precision,
                tolerance: tolerance,
                instrumentName: measuringTool?.name || '',
                phValue: currentItem?.phValue ?? item?.phValue ?? null,
              })
            } else {
              // No pour (heating, or moving one vessel's liquid into another):
              // the result keeps the liquid both items already hold.
              const existingVolume =
                getContents(currentItem) + getContents(item)
              const record: MeasurementRecord = {
                stepIndex: currentStepIndex,
                description: currentStep?.description,
                apparatusName: item?.name || '',
                substanceName: currentItem?.name || '',
                targetVolume: undefined,
                inputVolume: existingVolume,
                recordedVolume: existingVolume,
                unit: 'cm³',
                precision: 0,
                tolerance: 0,
                isAcceptable: true,
                difference: 0,
                timestamp: Date.now(),
              }
              const updatedMeasurements = [
                ...measurementsRef.current,
                record,
              ]
              measurementsRef.current = updatedMeasurements

              setTimeout(
                () =>
                  mergeItems(currentItem, item, mergeRule, 0, 'cm³'),
                500
              )
              if (currentStepIndex === procedureSteps.steps.length - 1) {
                const dynamicGrade =
                  calculateSessionGrade(updatedMeasurements)
                const telemetry: SessionTelemetry = {
                  lessonId: props.lessonId || '',
                  startedAt: startTimeRef.current,
                  completedAt: Date.now(),
                  measurements: updatedMeasurements,
                  totalSteps: procedureSteps.steps.length,
                  completedSteps: procedureSteps.steps.length,
                  grading: dynamicGrade,
                }
                setIsCalculating(false)
                setCurrentStepIndex(currentStepIndex + 1)
                setIsExperimentCompleted(true)
                if (onExperimentComplete)
                  onExperimentComplete(true, telemetry, dynamicGrade)
                showModal(
                  `Experiment Complete!`,
                  `You've successfully completed the experiment! Dynamic Grade: ${dynamicGrade.overallGrade}% (Accuracy: ${dynamicGrade.averageTargetAdherence}%, Precision: ${dynamicGrade.averagePrecisionAdherence}%).`,
                  `Final product: ${
                    item?.name || 'Completed'
                  }. You can now submit your dynamic grade to Moodle!`
                )
              } else {
                setCurrentStepIndex(currentStepIndex + 1)
              }
            }
          } else {
            showModal(
              `Invalid Next Step!`,
              `${currentStep?.description}`,
              `Cannot combine ${currentItem?.name} and ${item?.name}. This is not a valid next step in the experiment!`
            )
            // setDroppedItems((currentItems) =>
            //   currentItems.filter((item) => item.id !== currentItem.id)
            // )
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
              alt={item.displayName || item.name}
              style={{ width: '10em', height: '10em', display: 'block' }}
            />
            <p className="text-sm font-medium[] truncate text-center">
              {item.displayName || item.name}
              {item?.formula && <TokenizeFormula formula={item?.formula} />}
              {item?.phValue != null && (
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                  pH {Number(item.phValue).toFixed(1)}
                </span>
              )}
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
            setIsExperimentCompleted(false)
            measurementsRef.current = []
            startTimeRef.current = Date.now()
            if (onExperimentComplete) onExperimentComplete(false)
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
      <VolumeInputDialog
        isOpen={volumeDialogData.isOpen}
        onClose={volumeDialogData.onCancel}
        onConfirm={volumeDialogData.onConfirm}
        maxVolume={volumeDialogData.maxVolume}
        recommendedVolume={volumeDialogData.recommendedVolume}
        capacity={volumeDialogData.capacity}
        contents={volumeDialogData.contents}
        precision={volumeDialogData.precision}
        tolerance={volumeDialogData.tolerance}
        instrumentName={volumeDialogData.instrumentName}
        phValue={volumeDialogData.phValue}
      />
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          itemX={contextMenu.currentItem.position.x}
          itemY={contextMenu.currentItem.position.y}
          onRemove={() => {
            setDroppedItems((currentItems) =>
              currentItems.filter(
                (item) => item.id !== contextMenu.currentItem.id
              )
            )
            setContextMenu({ ...contextMenu, visible: false })
          }}
          onVolumeChange={handleVolumeChange}
          itemType={contextMenu.currentItem.type}
          initialVolume={
            contextMenu.currentItem.volume ??
            contextMenu.currentItem.contents ??
            0
          }
        />
      )}
    </div>
  )
}

export default AnimationBox
