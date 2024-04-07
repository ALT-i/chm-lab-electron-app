import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import server from '../utils'
import DisplayClasses from './sections/DisplayClasses'
import { Typography } from '@material-tailwind/react'

const ClassSelector = (props: any) => {
  const [hashedClasses, setHashedClasses] = useState(null)
  const isPanelOpen = props.isPanelOpen
  const navigate = useNavigate()

  const addCompletedClass = (id: number) => {
    const classIds = JSON.parse(
      window.localStorage.getItem('completed_classes')
    )
    if (classIds && !classIds.includes(id)) {
      classIds.push(id)
      setHashedClasses(classIds)
      window.localStorage.setItem('completed_classes', JSON.stringify(classIds))
    } else {
      window.localStorage.setItem('completed_classes', JSON.stringify([id]))
    }
  }

  const getClassDetails = (e: any) => {
    console.log(e.target.id)
    addCompletedClass(e.target.id)
    const user_info = JSON.parse(window.localStorage.getItem('user_data'))
    axios
      .patch(
        `${server.absolute_url}/${server.user}/${user_info.id}/`,
        {
          progress: `${hashedClasses}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // "authorization": token
          },
        }
      )
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) => {
        if (err.message === 'Network Error') {
          console.log(err)
        }
      })

    navigate(`/home/${e.target.id}`)
  }

  useEffect(() => {
    if (hashedClasses) {
      for (const item of hashedClasses) {
        document.getElementById(item).classList.add('active')
      }
    }
    //     const hashedClasses = JSON.parse(window.localStorage.getItem("completed-classes"))
    //     const user_id = JSON.parse(window.localStorage.getItem("userid"))
    //     if(hashedClasses) {
    //          setCompletedClasses(hashedClasses);
    //     }{
    //         let token
    //         const tokenData = JSON.parse(window.localStorage.getItem("tokens"))
    //         if (!tokenData) {
    //             navigate('/auth')
    //         }else{
    //             token = `Bearer ` + tokenData.access
    //         }

    // axios.get(`${server.absolute_url}/${server.user_auth}/${user_id}`, {         //Get list of completed classes from server
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "authorization": token
    //             }
    //         }).then((res) => {
    //             setCompletedClasses(res.data.completed_class)  //Get completed class list from response
    //             window.localStorage.setItem("levels", JSON.stringify(res.data.completed_class))

    //         }).catch(err => {
    //             // if(err.message === "Network Error") setLevels(oldLevels);
    //             // console.log(err)

    //         })
  }, [])

  return (
    <div
      className={`main-content class-selector transition-all duration-300 ease-in-out ${
        isPanelOpen ? 'ml-52' : 'ml-16'
      }`}
    >
      <div className="flex bg-green-900 py-5 px-2 shadow-lg rounded-lg">
        <div className="row px-1">
          <img className="h-7 w-8 rounded-full" src="./noun_logo.png" alt="" />
          <img
            className="h-7 w-8 rounded-full"
            src="./acetel_logo.png"
            alt=""
          />
        </div>
        <Typography variant="h6" color="white">
          National Open University of Nigeria (NOUN)
          <p />
          Africa Centre of Excellence on Technology Enhanced Learning (ACETEL)
        </Typography>
      </div>
      <div className="selector-header">
        <h1>Pick an experiment to simulate</h1>
      </div>
      <div className="class-selection-grid">
        <DisplayClasses getClassDetails={getClassDetails} />
      </div>
    </div>
  )
}

export default ClassSelector
