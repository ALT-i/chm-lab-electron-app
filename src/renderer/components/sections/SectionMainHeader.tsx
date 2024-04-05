import React from 'react'

import { useNavigate } from 'react-router-dom'
import { useWindowStore } from 'renderer/store'

function SectionMainHeader() {
  const navigate = useNavigate()
  const store = useWindowStore().about

  return (
    <div className="main-header">
      <div className="flex items-center justify-center">
        <img className="img-circle" src="./noun_logo.png" alt="" />
        <img className="img-circle" src="./acetel_logo.png" alt="" />
      </div>
      <div className="">
        <h2 className="side-banner-text mt-5 mb-8">
          National Open University of Nigeria (NOUN)
          <br />
          Africa Centre of Excellence on Technology Enhanced Learning (ACETEL)
        </h2>
        <h3 className="subtext mt-12">
          {/* <p onClick={() => navigate('anotherScreen')} className='subtext'> */}
          <p className="subtext">CHM Virtual Lab</p>
        </h3>
      </div>
      {/* <button onClick = {() => {
                electron.notificationApi.sendNotification('My custom notification')
            }}>Notify</button> */}
    </div>
  )
}

export default SectionMainHeader
