import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import server from '../../utils'

function DisplayClasses(props: any) {
  const activateLink = props.activateLink
  const getClassDetails = props.getClassDetails
  const [classes, setClasses] = useState(null)
  const [userData, setUserData] = useState(null)
  const [sortAscending, setSortAscending] = useState(true) // Added state for sorting order
  const navigate = useNavigate()

  function getClasses() {
    const tokenData = JSON.parse(window.localStorage.getItem('auth_tokens'))
    const token = `Bearer ` + tokenData.access

    axios
      .get(`${server.absolute_url}/${server.workspace}/?limit=100`, {
        headers: {
          'Content-Type': 'application/json',
          // "authorization": token
        },
      })
      .then((res) => {
        window.localStorage.setItem('classes', JSON.stringify(res.data.data.results))
        console.log(res.data)
        setClasses(res.data.data.results)
      })
      .catch((err) => {
        if (err.message === 'Network Error') {
          console.log(err)
        }
      })
  }

  function sortClasses() {
    // Added sorting function
    if (classes) {
      const sortedClasses = [...classes].sort((a, b) => {
        const titleA = a.id // ignore upper and lowercase
        const titleB = b.id // ignore upper and lowercase
        if (titleA < titleB) {
          return sortAscending ? -1 : 1
        }
        if (titleA > titleB) {
          return sortAscending ? 1 : -1
        }
        return 0
      })
      setClasses(sortedClasses)
      setSortAscending(!sortAscending) // toggle the sort order for next click
    }
  }

  useEffect(() => {
    getClasses()
    // setClasses(JSON.parse(window.localStorage.getItem('classes')))
  }, [])

  return (
    <div>
      <div style={{ textAlign: 'right' }}>
        <button
          onClick={sortClasses}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="material-symbols-outlined">sort</span>
        </button>
      </div>
      <ul>
        {classes &&
          classes.map((topic) => (
            <li
              id={`${topic.id}`}
              key={topic.id}
              onClick={(e) => {
                if (activateLink) {
                  activateLink(e)
                } else {
                  getClassDetails(e)
                }
              }}
              className="!p-14 !text-center"
            >
              <img
                // if topic.image is not null or ends with default.png, use it, else use ./chem_views.svg
                // src={topic.image ? topic.image : './chem_views.svg'} // topic.image
                src={
                  topic.image && !topic.image.endsWith('default.png')
                    ? topic.image
                    : './chem_views.svg'
                }
                alt={topic.title}
                height={100}
                width={100}
                style={{
                  maxWidth: '100%',
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
              {topic.title}
            </li>
          ))}
      </ul>
    </div>
  )
}

export default DisplayClasses
