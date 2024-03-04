import React, { useState } from 'react'

import ClassSelector from 'renderer/components/ClassSelector'
import SectionSidePanel from 'renderer/components/sections/SectionSidePanel'

export function ClassSelectionView() {
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  return (
    <div className="class-selector-component">
      <SectionSidePanel isPanelOpen={isPanelOpen} togglePanel={togglePanel} />
      <ClassSelector isPanelOpen={isPanelOpen} />
    </div>
  )
}
