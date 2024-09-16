import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import server from '../utils'
import DisplayClasses from './sections/DisplayClasses'
import { Typography } from '@material-tailwind/react'
import RingLoader from 'react-spinners/RingLoader'

const ClassSelector = (props: any) => {
  const [hashedClasses, setHashedClasses] = useState(null)
  const [loading, setLoading] = useState(true) // Add loading state
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
    navigate(`/home/${e.target.id}`)
  }

  useEffect(() => {
    // Simulate fetching class details
    const fetchClassDetails = async () => {
      try {
        // Replace with your actual API call
        await axios.get(`${server.absolute_url}/classes`)
        setLoading(false) // Set loading to false after fetching
      } catch (error) {
        console.error('Error fetching class details:', error)
        setLoading(false) // Set loading to false even on error
      }
    }

    fetchClassDetails()
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
