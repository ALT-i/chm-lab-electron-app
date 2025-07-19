import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindowStore } from 'renderer/store'
import { Typography, Button, Card, CardBody, Avatar } from '@material-tailwind/react'
import { ds } from 'renderer/utils/design-system'
import { APP_VERSION } from 'shared/constants'

// The "App" comes from the context bridge in preload/index.ts
const { App } = window

function SectionSidePanel(props: any) {
  const navigate = useNavigate()
  const store = useWindowStore().about
  let isPanelOpen = props.isPanelOpen
  const togglePanel = props.togglePanel

  let userData = null
  let user_fname = ''

  try {
    const userDataString = window.localStorage.getItem('user_data')
    if (userDataString) {
      userData = JSON.parse(userDataString) || {}
      user_fname = userData || 'Student'
    }
  } catch (error) {
    console.error('Error parsing user data:', error)
    user_fname = 'Student'
  }

  function goToLogin() {
    window.localStorage.removeItem('user_data')
    window.localStorage.removeItem('auth_tokens')
    window.localStorage.removeItem('intro_video_seen')
    navigate(`/`)
  }

  function openAboutScreen() {
    navigate('/about')
  }

  function replayIntroVideo() {
    window.localStorage.removeItem('intro_video_seen')
    navigate('/intro-video')
  }

  function goToClassList() {
    navigate(`/home`)
  }

  function openApparatus() {
    navigate('/shelf/apparatus')
  }

  function openSubstances() {
    navigate('/shelf/substance')
  }

  const menuItems = [
    {
      icon: '🏠',
      label: 'Dashboard',
      action: () => {
        goToClassList()
        if (isPanelOpen) togglePanel()
      },
      active: location.pathname === '/home' || location.pathname.startsWith('/home'),
    },
    {
      icon: '🧪',
      label: 'Apparatus',
      action: () => {
        openApparatus()
        if (isPanelOpen) togglePanel()
      },
      active: location.pathname === '/shelf/apparatus',
    },
    {
      icon: '🧬',
      label: 'Substances',
      action: () => {
        openSubstances()
        if (isPanelOpen) togglePanel()
      },
      active: location.pathname === '/shelf/substance',
    },
    {
      icon: '🎥',
      label: 'Intro Video',
      action: () => {
        replayIntroVideo()
        if (isPanelOpen) togglePanel()
      },
      active: location.pathname === '/intro-video',
    },
    {
      icon: 'ℹ️',
      label: 'About',
      action: () => {
        openAboutScreen()
        if (isPanelOpen) togglePanel()
      },
      active: location.pathname === '/about',
    },
  ]

  return (
    <div className="relative">
      {/* Hamburger Menu Button */}
      <Button
        onClick={togglePanel}
        className={`fixed top-4 left-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-300 ${
          isPanelOpen
            ? 'bg-white text-gray-700 hover:bg-gray-50'
            : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
        title={isPanelOpen ? 'Close Panel' : 'Open Panel'}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isPanelOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </Button>

      {/* Side Panel */}
      <div
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg transform transition-all duration-300 ease-in-out z-40 ${
          isPanelOpen ? 'w-64 translate-x-0' : 'w-16 translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full bg-white shadow-2xl border-r border-gray-200">
          {/* Header */}
          <div className={`bg-gray-900 text-white border-b border-gray-200 transition-all duration-300 ${
            isPanelOpen ? 'p-6' : 'p-3'
          }`}>
            <div className={`flex items-center mb-4 ${isPanelOpen ? 'space-x-3' : 'justify-center'}`}>
              <div
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-blue-700 transition-colors"
                title={isPanelOpen ? undefined : 'CHM Lab - Virtual Chemistry'}
                onClick={isPanelOpen ? undefined : goToClassList}
              >
                <span className="text-lg">🧪</span>
              </div>
              {isPanelOpen && (
                <div>
                  <div className="flex items-center justify-between">
                    <Typography className="font-bold text-white text-lg">
                      CHM Lab
                    </Typography>
                    <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                      v{APP_VERSION}
                    </span>
                  </div>
                  <Typography className="text-gray-300 text-sm">
                    Virtual Chemistry
                  </Typography>
                </div>
              )}
            </div>
          </div>

          {/* User Profile - Always show avatar, even when collapsed */}
          <div className={`border-b border-gray-100 transition-all duration-300 ${
            isPanelOpen ? 'p-6' : 'p-3'
          }`}>
            <div className={`flex items-center ${isPanelOpen ? 'space-x-3' : 'justify-center'}`}>
              <div
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 cursor-pointer hover:bg-blue-700 transition-colors"
                title={isPanelOpen ? undefined : `${user_fname} - Chemistry Student`}
              >
                {user_fname.charAt(0).toUpperCase()}
              </div>
              {isPanelOpen && (
                <div className="flex-1">
                  <Typography className="font-semibold text-gray-900">
                    {user_fname}
                  </Typography>
                  <Typography className="text-sm text-gray-500">
                    Chemistry Student
                  </Typography>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu - Always functional */}
          <nav className={`flex-1 space-y-2 transition-all duration-300 ${isPanelOpen ? 'p-4' : 'p-2'}`}>
            {isPanelOpen && (
              <Typography className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                Navigation
              </Typography>
            )}

            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`w-full flex items-center rounded-lg transition-all duration-200 group relative ${
                  isPanelOpen ? 'space-x-3 px-3 py-3' : 'px-2 py-3 justify-center'
                } ${
                  item.active
                    ? 'bg-green-100 text-green-700 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isPanelOpen ? undefined : item.label}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {isPanelOpen && <span className="font-medium">{item.label}</span>}
                {isPanelOpen && item.active && (
                  <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                )}

                {/* Tooltip for collapsed state */}
                {!isPanelOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Stats - Compact version when collapsed */}
          <div className={`border-t border-gray-100 transition-all duration-300 ${
            isPanelOpen ? 'p-4' : 'p-2'
          }`}>
            {isPanelOpen ? (
              <div className="grid grid-cols-1 gap-3">
                <Card className="bg-green-50 border border-green-100">
                  <CardBody className="p-3 text-center">
                    <Typography className="text-lg font-bold text-green-600">
                      Lab
                    </Typography>
                    <Typography className="text-xs text-green-700">
                      Ready
                    </Typography>
                  </CardBody>
                </Card>
              </div>
            ) : (
              <div className="flex justify-center">
                <div
                  className="w-8 h-8 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-100 transition-colors group relative"
                  title="Lab Status: Ready"
                >
                  <span className="text-lg">✅</span>

                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Lab Ready
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions - Always functional */}
          <div className={`border-t border-gray-100 transition-all duration-300 ${
            isPanelOpen ? 'p-4' : 'p-2'
          }`}>
            {isPanelOpen ? (
              <Button
                onClick={goToLogin}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </Button>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={goToLogin}
                  className="w-8 h-8 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 border border-red-100 flex items-center justify-center group relative"
                  title="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>

                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Logout
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay - Only show when panel is open */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
          onClick={togglePanel}
        />
      )}
    </div>
  )
}

export default SectionSidePanel
