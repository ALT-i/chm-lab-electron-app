import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindowStore } from 'renderer/store'
import axios from 'axios'

import DraggableItem from './DraggableItem'

import server from '../../utils'
import { Card, Drawer, IconButton, Typography } from '@material-tailwind/react'

// The "App" comes from the context bridge in preload/index.ts
const { App } = window

function SectionSidePanel(props: any) {
  // const [instructorName, setInstructorName] = useState(null);
  const substances = props.substances
  const apparatus = props.tools
  const classInstructor = props.classInstructor
  let isPanelOpen = props.isPanelOpen
  const togglePanel = props.togglePanel
  const [isShelfOpen, setIsShelfOpen] = useState(false)
  const [isShelfMenuOpen, setIsShelfMenuOpen] = useState(false)
  const [isIconRotated, setIsIconRotated] = useState(false)

  const navigate = useNavigate()
  const store = useWindowStore().about

  const userData = JSON.parse(window.localStorage.getItem('user_data'))
  const user_fname = userData?.first_name

  function toggleShelfMenu() {
    setIsShelfMenuOpen(!isShelfMenuOpen)
    setIsIconRotated(!isIconRotated)
  }

  function goToLogin() {
    window.localStorage.removeItem('user_data')
    window.localStorage.removeItem('auth_tokens')
    navigate(`/`)
  }

  function openAboutWindow() {
    App.createAboutWindow()
    store.setAboutWindowState(true)
  }

  function goToClassList() {
    setTimeout(() => navigate(`/select-class`), 200)
  }

  function openApparatus() {
    navigate('/shelf/apparatus')
  }

  function openSubstances() {
    navigate('/shelf/substance')
  }

  return (
    <section className="relative left-side-panel">
      <button
        className="hamburger-menu p-2 absolute top-2 left-1 z-10 border my-1 mx-2 border-green-500 bg-gray-400 px-4 py-2 text-lg rounded cursor-pointer shadow transition-all hover:bg-green-900 hover:text-white hover:shadow"
        onClick={togglePanel}
      >
        &#9776; {/* Hamburger icon */}
      </button>
      <Drawer
        className="panel w-64 h-screen"
        open={isPanelOpen}
        onClose={togglePanel}
      >
        <Card
          color="transparent"
          shadow={false}
          className="h-[calc(100vh-2rem)] w-full p-4"
        >
          <div
            className={`panel ${
              isPanelOpen ? 'block' : 'hidden'
            } bg-gray-200 fixed top-0 left-0`}
          >
            <div className="flex items-center gap-4 p-4 bg-green-900">
              <Typography variant="h6" color="white" className="px-3">
                Virtual Chemistry Lab
              </Typography>
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={togglePanel}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            </div>
            <div className="basic-profile">
              <Typography variant="h6" color="white" className="px-5">
                <p>Hi {user_fname}</p>
              </Typography>
            </div>
            <div id="element" className="work">
              <div className="profile-options">
                <div className="profile-option">
                  <div className="option" onClick={goToClassList}>
                    <p>Experiment list</p>
                    <span className="material-symbols-outlined data_info_alert">
                      data_info_alert
                    </span>
                  </div>
                </div>
                <div className="profile-option">
                  <div className="option" onClick={toggleShelfMenu}>
                    {/* Icon on the left */}
                    <p>Stockroom</p>
                    <span className="material-symbols-outlined inventory py-4 px-3">
                      inventory
                    </span>
                    {/* <span
                      className={`material-symbols-outlined expand_more ${
                        isIconRotated ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span> */}
                  </div>
                  {isShelfMenuOpen && (
                    <div className="submenu bg-gray-200 py-3 px-6">
                      <div
                        className="option submenu-item hover:bg-green-200"
                        onClick={openApparatus}
                      >
                        <p>Apparatus</p>
                      </div>
                      <div
                        className="option submenu-item hover:bg-green-200"
                        onClick={openSubstances}
                      >
                        <p>Substances</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="profile-option">
                  <div className="option">
                    <p className="strikethrough">Profile</p>
                    <span className="material-symbols-outlined person">
                      person
                    </span>
                  </div>
                </div>
                <div className="profile-option">
                  <div className="option">
                    <p className="strikethrough">Settings</p>
                    <span className="material-symbols-outlined settings">
                      settings
                    </span>
                  </div>
                </div>
                <div className="profile-option">
                  <div className="option" onClick={openAboutWindow}>
                    <p>About</p>
                    <span className="material-symbols-outlined info">info</span>
                  </div>
                </div>
                <div className="profile-option">
                  <div className="option" onClick={goToLogin}>
                    <p>Log out</p>
                    <span className="material-symbols-outlined logout">
                      logout
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Drawer>
    </section>
  )
}

export default SectionSidePanel
