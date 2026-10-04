import React from 'react'

import ShelfPage from 'renderer/components/ShelfPage'
import SectionSidePanel from 'renderer/components/sections/SectionSidePanel'
import { useSidebarState } from 'renderer/utils/use-sidebar-state'

export function Shelf() {
  const { isPanelOpen, togglePanel } = useSidebarState()

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
