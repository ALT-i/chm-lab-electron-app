import React, { useState } from 'react'

import ShelfPage from 'renderer/components/ShelfPage'
import SectionSidePanel from 'renderer/components/sections/SectionSidePanel'

export function Shelf() {
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  return (
    <div className="components">
      <SectionSidePanel isPanelOpen={isPanelOpen} togglePanel={togglePanel} />

      {/* {chosenClass ? (
        <SectionSidePanel
          substances={substances}
          tools={tools}
          classInstructor={classInstructor}
          isPanelOpen={isPanelOpen}
          togglePanel={togglePanel}
        />
      ) : (
        <SectionSidePanel />
      )} */}
      <ShelfPage isPanelOpen={isPanelOpen} />
    </div>
  )
}
