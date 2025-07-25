import { Router, Route } from 'electron-router-dom'

import {
  AuthScreen,
  AboutScreen,
  AnotherScreen,
  Dashboard,
  ClassSelectionView,
  Shelf,
  IntroVideoScreen,
} from 'renderer/screens'

export function AppRoutes() {
  return (
    <Router
      main={
        <>
          <Route path="/" element={<AuthScreen />} />
          <Route path="/intro-video" element={<IntroVideoScreen />} />
          <Route path="/about" element={<AboutScreen />} />
          <Route path="/select-class" element={<ClassSelectionView />} />
          <Route path="/home" element={<ClassSelectionView />} />
          <Route path="/home/:class_id" element={<Dashboard />} />
          <Route path="/shelf/:type" element={<Shelf />} />
        </>
      }
      about={<Route path="/" element={<AboutScreen />} />}
    />
  )
}
