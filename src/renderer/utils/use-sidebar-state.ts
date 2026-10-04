import { useCallback, useState } from 'react'

// Shared by every screen that renders SectionSidePanel, so collapsing the
// sidebar on one screen keeps it collapsed after navigating to another.
const SIDEBAR_OPEN_KEY = 'chem_lab_sidebar_open'

function readSidebarOpen(): boolean {
  try {
    const saved = localStorage.getItem(SIDEBAR_OPEN_KEY)
    return saved !== null ? saved === 'true' : true
  } catch {
    return true
  }
}

export function useSidebarState() {
  const [isPanelOpen, setIsPanelOpen] = useState(readSidebarOpen)

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_OPEN_KEY, String(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }, [])

  return { isPanelOpen, togglePanel }
}
