import { Router, Route } from 'electron-router-dom'

import {
  AuthScreen,
  AboutScreen,
  AnotherScreen,
  Dashboard,
  ClassSelectionView,
} from 'renderer/screens'

export function AppRoutes() {
  return (
    <Router
      main={
        <>
          <Route path="/" element={<AuthScreen />} />
          <Route path="/select-class" element={<ClassSelectionView />} />
          <Route path="/home" element={<ClassSelectionView />} />
          <Route path="/home/:class_id" element={<Dashboard />} />
        </>
      }
      about={<Route path="/" element={<AboutScreen />} />}
    />
  )
}
