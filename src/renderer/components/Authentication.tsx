import React from 'react'
import { useState } from 'react'
import SectionSignUp from './sections/SectionSignUp'
import SectionLogin from './sections/SectionLogin'

function Authentication() {
  const [isRegistered, setIsRegistered] = useState(!null)

  return (
    <div className="auth-section float-child">
      {isRegistered ? (
        <div className="authentication">
          <SectionLogin />
          <div className="foot-note">
            <p onClick={() => setIsRegistered(false)}>
              Sign up as a student...
            </p>
          </div>
        </div>
      ) : (
        <div className="authentication">
          <SectionSignUp />
          <div className="foot-note">
            <p onClick={() => setIsRegistered(true)}>
              Already have an account? Login
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Authentication
