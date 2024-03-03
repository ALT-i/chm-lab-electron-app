import ReactDom from 'react-dom/client'
import React from 'react'

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


import { WindowStoreProvider } from './store'
import { AppRoutes } from './routes'

import 'resources/styles/main.css'
import 'material-symbols'

ReactDom.createRoot(document.querySelector('app') as HTMLElement).render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <WindowStoreProvider>
        <AppRoutes />
      </WindowStoreProvider>
    </DndProvider>
  </React.StrictMode>
)
