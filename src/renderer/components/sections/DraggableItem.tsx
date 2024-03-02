import { useDrag } from 'react-dnd'

interface DraggableItemProps {
  item: string
  type: 'SUBSTANCE' | 'TOOL'
}

function DraggableItem({ item, type }: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: type,
    item: { id: item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div ref={dragRef} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {item}
    </div>
  )
}

export default DraggableItem
