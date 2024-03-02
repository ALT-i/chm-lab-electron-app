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

  function goToClassList() {
    setTimeout(() => navigate(`/select-class`), 200)
  }

  // useEffect(() => {
  // })

  return (
    <section className="left-side-panel">
      <div className="panel">
        <div className="basic-profile">
          <div className="user-name">
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
                          apparatus.map((tool) => (
                            // <li>{tool}</li>
                            <li>
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
                          substances.map((subs) => (
                            // <li>{subs}</li>
                            <li>
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
