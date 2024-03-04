import React, { useState } from 'react'

import IndexPage from 'renderer/components/IndexPage'
import SectionSidePanel from 'renderer/components/sections/SectionSidePanel'

export function Dashboard() {
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
      <IndexPage isPanelOpen={isPanelOpen} />
    </div>
  )
}
