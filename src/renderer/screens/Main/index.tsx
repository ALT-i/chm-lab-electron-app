import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import { Container, Heading, Button } from 'renderer/components'
import { useWindowStore } from 'renderer/store'
import IndexHeader from 'renderer/components/IndexHeader'
import Authentication from 'renderer/components/Authentication'

// The "App" comes from the context bridge in preload/index.ts
const { App } = window

export function AuthScreen() {
  const navigate = useNavigate()
  const store = useWindowStore().about

  useEffect(() => {
    App.sayHelloFromBridge()

    App.whenAboutWindowClose(({ message }) => {
      console.log(message)

      store.setAboutWindowState(false)
    })
  }, [])

  function openAboutWindow() {
    App.createAboutWindow()
    store.setAboutWindowState(true)
  }

  return (
    <Container>

      <div className="auth-component">
        <IndexHeader></IndexHeader>
        <Authentication></Authentication>
      </div>

      {/* <Heading>Hi, {App.username || 'there'}! 👋</Heading>

      <h2>It's time to build something! ✨</h2>

      <nav>
        <Button
          className={store.isOpen ? 'disabled' : ''}
          onClick={openAboutWindow}
        >
          Open About Window
        </Button>

        <Button onClick={() => navigate('anotherScreen')}>
          Go to Another screen
        </Button>
      </nav> */}
    </Container>
  )
}
