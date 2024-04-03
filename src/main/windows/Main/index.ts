import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

import { ENVIRONMENT } from 'shared/constants'
import { createWindow } from 'main/factories'
import { displayName } from '~/package.json'

export async function MainWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const windowWidth = Math.round(width * 0.9)
  const windowHeight = Math.round(height * 0.9)
  const window = createWindow({
    id: 'main',
    title: displayName,
    width: windowWidth,
    height: windowHeight,
    show: false,
    center: true,
    movable: true,
    resizable: true,
    alwaysOnTop: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../resources/build/icons/icon.ico'),

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
    },
  })

  window.webContents.on('did-finish-load', () => {
    if (ENVIRONMENT.IS_DEV) {
      window.webContents.openDevTools({ mode: 'detach' })
    }

    window.show()
  })

  window.on('close', () =>
    BrowserWindow.getAllWindows().forEach((window) => window.destroy())
  )

  return window
}
