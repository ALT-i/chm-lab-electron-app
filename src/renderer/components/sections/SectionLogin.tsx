import React, { useEffect, useState, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { jwtDecode as jwt_decode } from 'jwt-decode'

import PulseLoader from 'react-spinners/PulseLoader'

import { Button } from 'renderer/components'

import server from '../../utils/index'
import { getAuthHeader } from '../../utils/index'

function SectionLogin() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isloading, setIsLoading] = useState(false)
  const override: CSSProperties = {
    fontWeight: '400',
  }

  type authResData = {
    user_id?: string
  }

  async function getUserData(id: string, email: string, token: string) {
    try {
      const response = await axios.get(
        `${server.absolute_url}/${server.user}/${id}/`
      )
      const payload = response?.data?.data
      const firstName = payload?.first_name || 'Student'
      const userEmail = payload?.email || email
      window.localStorage.setItem('user_data', JSON.stringify(firstName))
      window.localStorage.setItem('user_email', userEmail)

      // Fetch Moodle profile
      try {
        const moodleResponse = await axios.get(
          `${server.absolute_url}/${server.moodle_user_profile}?email=${encodeURIComponent(userEmail)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )
        const moodleProfile = moodleResponse.data
        window.localStorage.setItem('moodle_profile', JSON.stringify(moodleProfile))

        // Use Moodle profile data if available
        if (moodleProfile.firstname && moodleProfile.lastname) {
          const moodleFullName = `${moodleProfile.firstname} ${moodleProfile.lastname}`
          window.localStorage.setItem('user_data', JSON.stringify(moodleFullName))
        }
        if (moodleProfile.profileimageurl) {
          window.localStorage.setItem('user_avatar', moodleProfile.profileimageurl)
        }

        console.log('Moodle profile fetched:', moodleProfile)
      } catch (moodleError) {
        console.warn('Could not fetch Moodle profile:', moodleError)
        // Not critical, continue login
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setFeedback(error instanceof Error ? error.message : 'Unknown error')
      // Consider redirecting to login or showing error message
    }
  }

  const authLogin = (e: any) => {
    setIsLoading(true)
    e.preventDefault()

    // console.log(`${server.absolute_url}/${server.user_auth}/login`) ///api/v1/users/
    axios
      .post(
        `${server.absolute_url}/${server.auth_signin}`,
        {
          email: e.target[0].value,
          password: e.target[1].value,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        window.localStorage.setItem('auth_tokens', JSON.stringify(res.data))
        const email = e.target[0].value
        const userInfo: authResData = jwt_decode(res.data.access)
        if (userInfo.user_id) {
          getUserData(userInfo.user_id, email, res.data.access)
        }
        setFeedback(null)
        setTimeout(() => {
          // Check if user has seen intro video for this session
          const introVideoSeen = window.localStorage.getItem('intro_video_seen')
          if (introVideoSeen === 'true') {
            // User has seen intro video, go directly to home
            navigate('/home')
          } else {
            // User hasn't seen intro video, show it first
            navigate('/intro-video')
          }
          setIsLoading(false)
        }, 1000)
      })
      .catch((err) => {
        console.log(err)
        setIsLoading(false)
        if (err.message.includes('401')) {
          setFeedback('Invalid credentials')
        }
      })
  }

  useEffect(() => {
    if (!feedback) setFeedback(null)
  }, [authLogin])

  return (
    <div className="section-login">
      {feedback && <p className="alert">{feedback}</p>}
      <br />
      <form action="" onSubmit={authLogin} id="login" className="login">
        <div>
          <label htmlFor="email">Email:</label>
          <input id="email" type="text" name="username" />
        </div>
        <div>
          <label htmlFor="pwd">Password:</label>
          <input id="pwd" type="password" name="password" />
        </div>
        <div className="submit">
          <Button value="Submit" type="submit" form="login">
            {isloading ? (
              <PulseLoader
                color={'#ffffff'}
                loading={true}
                cssOverride={override}
                size={10}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              'Login'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SectionLogin
