import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindowStore } from 'renderer/store'
import axios from 'axios'

import DraggableItem from './DraggableItem'

import server from '../../utils'

// The "App" comes from the context bridge in preload/index.ts
const { App } = window

function SectionSidePanel(props: any) {
  // const [instructorName, setInstructorName] = useState(null);
  const substances = props.substances
  const apparatus = props.tools
  const classInstructor = props.classInstructor
  const isPanelOpen = props.isPanelOpen
  const togglePanel = props.togglePanel
  // console.log(substances, apparatus, classInstructor)

  const navigate = useNavigate()
  const store = useWindowStore().about

  const userData = JSON.parse(window.localStorage.getItem('user_data'))
  const user_fname = userData.first_name

  // document.addEventListener("mousemove", function(e){
  //     const ele = document.getElementById('element');
  //     const distance = ele.offsetLeft + ele.offsetWidth - e.pageX;
  //     distance < 8 && distance > -0.1 ? ele.classList.add('more-width') : ele.classList.remove('more-width');
  // });

  // const user_dp = JSON.parse(window.localStorage.getItem("dp"))  //Maybe get dp from local machine
  // const getInsutructor = () => {
  //     axios.post(`${server.absolute_url}/${server.}`)
  // }

  function goToLogin() {
    window.localStorage.removeItem('user_data')
    window.localStorage.removeItem('auth_tokens')
    navigate(`/`)
  }

  function openAboutWindow() {
    App.createAboutWindow()
    store.setAboutWindowState(true)
  }

  const goBack = () => {
    navigate(-1) // Go back to the previous page
  }

  function goToClassList() {
    setTimeout(() => navigate(`/select-class`), 200)
  }

  // useEffect(() => {
  // })

  return (
    <section className="relative left-side-panel">
      <button
        className="hamburger-menu p-2 absolute top-0 left-1 z-10 border my-1 mx-2 border-green-500 text-darkgreen-500 bg-gray-100 px-4 py-2 text-lg rounded cursor-pointer shadow transition-all hover:bg-green-500 hover:text-white hover:shadow"
        onClick={togglePanel}
      >
        &#9776; {/* Hamburger icon */}
      </button>
      <div
        className={`panel ${
          isPanelOpen ? 'block' : 'hidden'
        } bg-gray-200 w-64 h-screen fixed top-0 left-0 transition-all duration-300 ease-in-out`}
      >
        <div className="basic-profile">
          <div className="user-name pt-10">
            <p>Hi {user_fname}</p>
          </div>
          <div className="user-picture">
            {/* <div className="picture"></div> */}
            <i className="fa fa-user-circle-o" aria-hidden="true"></i>
          </div>
        </div>
        {/* {substances? null:<div className="continue-class">
                    <div className="continue-button">
                        <p>Continue class</p>
                        <span className="material-symbols-outlined">
                            patient_list
                        </span>
                    </div>
                </div>} */}
        <div id="element" className="work">
          {substances && (
            <div className="workspace-workbench-compartment">
              <div className="workbench">
                {/* <div className="instructor">
                                <p>{classInstructor}</p>
                            </div> */}
                <div className="workbench-apparatus">
                  <div className="apparatus-section">
                    <div className="apparatus-options-header">
                      <p>Apparatus</p>
                      <i className="fa fa-cubes" aria-hidden="true"></i>
                    </div>
                    <div className="apparatus-options">
                      <ul className="apparatus-list">
                        {apparatus &&
                          apparatus.map((tool, index) => (
                            // <li>{tool}</li>
                            <li key={index}>
                              <DraggableItem item={tool} type="TOOL" />
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="workbench-substances">
                  <div className="substance-section">
                    <div className="substance-options-header">
                      <p>Substances</p>
                      <i className="fa fa-cubes" aria-hidden="true"></i>
                    </div>
                    <div className="substance-options">
                      <ul className="substance-list">
                        {substances &&
                          substances.map((subs, index) => (
                            // <li>{subs}</li>
                            <li key={index}>
                              <DraggableItem item={subs} type="SUBSTANCE" />
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <button
            className="bg-white hover:bg-gray-100 text-gray-800 float-right font-semibold py-2 px-5 my-1 mx-1 border border-gray-400 rounded shadow"
            onClick={goBack}
          >
            &#10094;
          </button>
          <div className="profile-options">
            <div className="profile-option">
              <div className="option" onClick={goToClassList}>
                <p>Class list</p>
                <span className="material-symbols-outlined data_info_alert">
                  data_info_alert
                </span>
              </div>
            </div>
            <div className="profile-option">
              <div className="option">
                <p className="strikethrough">Profile</p>
                <span className="material-symbols-outlined person">person</span>
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
                <span className="material-symbols-outlined logout">logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SectionSidePanel
