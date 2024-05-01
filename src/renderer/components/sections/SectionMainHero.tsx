import React, { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import server from '../../utils'
import DisplayLevels from './DisplayLevels'

function SectionMainHero() {
  const [levelState, setLevelState] = useState(null)

  const navigate = useNavigate()

  const activateLink = (e: any) => {
    setLevelState(!levelState)
    const oldLevels = JSON.parse(window.localStorage.getItem('oldlevels'))
    if (oldLevels) {
      if (oldLevels.includes(e.target.id)) return

      let token
      const tokenData = JSON.parse(window.localStorage.getItem('tokens'))
      if (!tokenData) {
        navigate('/')
      } else {
        token = `Bearer ` + tokenData.access
      }

      axios
        .get(`${server.absolute_url}/questions`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        })
        .then((res) => {
          if (res.status === 200) {
            window.localStorage.setItem('categories', JSON.stringify(res.data))
            e.target.classList.add('active')
            oldLevels.push(e.target.id)
            window.localStorage.setItem('oldlevels', JSON.stringify(oldLevels))
          }
        })
        .catch((err) => console.log(err))
    } else {
      let token
      const tokenData = JSON.parse(window.localStorage.getItem('tokens'))
      if (!tokenData) {
        navigate('/')
      } else {
        token = `Bearer ` + tokenData.access
      }

      axios
        .get(`${server.absolute_url}/questions`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        })
        .then((res) => {
          if (res.status === 200) {
            window.localStorage.setItem('categories', JSON.stringify(res.data))
            e.target.classList.add('active')
            window.localStorage.setItem(
              'oldlevels',
              JSON.stringify([e.target.id])
            )
          }
        })
        .catch((err) => console.log(err))
    }
  }

  // useEffect(() => {
  //    const levels = JSON.parse(window.localStorage.getItem("oldlevels"))
  //       setTimeout(() => {
  //        if (levels){for (const level of levels){
  //         document.getElementById(level).classList.add("active")
  //     }}
  // }, 1)
  // }, [levelState])

  return (
    <div className="main-hero">
      <div className="hero-section">
        <div className="intro-paragraph">
          <p>Class title</p>
        </div>
      </div>
      <div className="difficulty-selection">
        <ul>
          <li>
            <a href="/main_window">Go to class selection</a>
          </li>
          <li>About this class</li>
          <li>Attempt quiz</li>
        </ul>
      </div>
    </div>
  )
}

export default SectionMainHero
