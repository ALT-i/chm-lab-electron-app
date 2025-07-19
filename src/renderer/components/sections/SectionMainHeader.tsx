import React from 'react'

import { useNavigate } from 'react-router-dom'
import { useWindowStore } from 'renderer/store'

import { Typography } from '@material-tailwind/react'

// Get version from environment or use a default
const APP_VERSION = process.env.npm_package_version || '0.9.5'

function SectionMainHeader() {
  const navigate = useNavigate()
  const store = useWindowStore().about

  return (
    <div className="main-header">
      <div className="flex items-center justify-center mb-20">
        <img className=" h-80 p-0" src="./noun_acetel_logo.png" alt="" />
        {/* <img
          className="img-circle !w-72 !h-72"
          src="./acetel_logo.png"
          alt=""
        /> */}
      </div>
      <div className="">
        <Typography
          color="lime"
          className="font-normal flex w-full justify-center items-center text-2xl m-8 p-8"
          placeholder={''}
          variant="h6"
        >
          {/* <h2 className="side-banner-text mt-5 mb-8"> */}
          National Open University of Nigeria (NOUN)
          <br />
          Africa Centre of Excellence on Technology Enhanced Learning (ACETEL)
          {/* </h2> */}
        </Typography>
        <div className="subtext">
          {/* <p onClick={() => navigate('anotherScreen')} className='subtext'> */}
          <Typography
            color="white"
            className="font-normal flex w-full justify-center items-center text-2xl m-3 p-3"
            placeholder={''}
            variant="h6"
          >
            Virtual Chemistry Lab
          </Typography>
          <p className="italic text-lime-200">v{APP_VERSION}</p>
        </div>
      </div>
      {/* <button onClick = {() => {
                electron.notificationApi.sendNotification('My custom notification')
            }}>Notify</button> */}
    </div>
  )
}

export default SectionMainHeader
