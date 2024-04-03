import { useDrag } from 'react-dnd'
import TokenizeFormula from '../Formula'

interface DraggableItemProps {
  item: string
  type: 'SUBSTANCE' | 'TOOL'
}

function DraggableItem({ item, type }: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: type,
    item: item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={dragRef}
      className="align-top"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <img className="w-40 h-20 text-center" src={item.image} />
      <p className="text-pretty text-sm truncate text-center">
        {item.name}
        {type === 'SUBSTANCE' && <TokenizeFormula formula={item.formula} />}
      </p>
    </div>
  )
}

export default DraggableItem
