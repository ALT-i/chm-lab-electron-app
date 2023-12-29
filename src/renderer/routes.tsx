import { Router, Route } from 'electron-router-dom'

import { AuthScreen, AboutScreen, AnotherScreen, Dashboard, ClassSelectionView} from 'renderer/screens'


export function AppRoutes() {
  return (
    <Router
      main={
        <>
          <Route path="/" element={<AuthScreen />} />
          <Route path="/select-class" element={<ClassSelectionView />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/home/:class_id" element={<Dashboard />} />
          <Route path="/anotherScreen" element={<AnotherScreen />} />
        </>
      }
      about={<Route path="/" element={<AboutScreen />} />}
    />
  )
}
