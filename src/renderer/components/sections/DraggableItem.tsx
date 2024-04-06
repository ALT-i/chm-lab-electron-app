import { useDrag } from 'react-dnd'
import TokenizeFormula from '../Formula'

interface DraggableItemProps {
  item: {
    id: string // Assuming the item now includes an id
    image: string
    name: string
    formula?: string // Assuming formula is optional
  }
  type: 'SUBSTANCE' | 'TOOL'
}

function DraggableItem({ item, type }: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: type,
    item: { ...item, id: `${type}-${item.id}` },
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
