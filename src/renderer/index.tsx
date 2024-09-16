import ReactDom from 'react-dom/client'
import React from 'react'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { ThemeProvider } from '@material-tailwind/react'

import { WindowStoreProvider } from './store'
import { AppRoutes } from './routes'

import 'resources/styles/main.css'
import 'material-symbols'

ReactDom.createRoot(document.querySelector('app') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <DndProvider backend={HTML5Backend}>
        <WindowStoreProvider>
          <AppRoutes />
        </WindowStoreProvider>
      </DndProvider>
    </ThemeProvider>
  </React.StrictMode>
)
