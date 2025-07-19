import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography } from '@material-tailwind/react'
import VideoPlayer from 'renderer/components/VideoPlayer'
import { getIntroVideoConfig } from 'renderer/utils/intro-video-config'

interface IntroVideoScreenProps {
  introVideoUrl?: string
  onComplete?: () => void
}

const IntroVideoScreen: React.FC<IntroVideoScreenProps> = ({
  introVideoUrl,
  onComplete
}) => {
  const navigate = useNavigate()
  const config = getIntroVideoConfig()
  const [isVideoCompleted, setIsVideoCompleted] = useState(false)
  const [isVideoError, setIsVideoError] = useState(false)
  const [showSkipButton, setShowSkipButton] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Use provided URL or fall back to config
  const videoUrl = introVideoUrl || config.videoUrl

  // Show skip button after configured delay
  useEffect(() => {
    if (config.showSkipButton) {
      const timer = setTimeout(() => {
        setShowSkipButton(true)
      }, config.skipButtonDelay)

      return () => clearTimeout(timer)
    }
  }, [config.showSkipButton, config.skipButtonDelay])

  const handleVideoEnd = () => {
    setIsVideoCompleted(true)
    // Mark that user has seen intro video for this session
    window.localStorage.setItem('intro_video_seen', 'true')

    // Call onComplete callback if provided
    onComplete?.()

    // Navigate to main app after a short delay
    setTimeout(() => {
      navigate('/home')
    }, 1500)
  }

  const handleVideoError = (error: string) => {
    console.error('Intro video error:', error)
    setIsVideoError(true)
  }

  const handleSkipVideo = () => {
    // Mark that user has seen intro video for this session
    window.localStorage.setItem('intro_video_seen', 'true')
    navigate('/home')
  }

  const handleContinueToApp = () => {
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-green-800 text-white p-6 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <img
              className="h-12 w-12 rounded-full"
              src="./noun_logo.png"
              alt="NOUN Logo"
            />
            <img
              className="h-12 w-12 rounded-full"
              src="./acetel_logo.png"
              alt="ACETEL Logo"
            />
          </div>
          <Typography variant="h4" className="font-bold">
            {config.title}
          </Typography>
          <Typography variant="paragraph" className="mt-2 opacity-90">
            {config.subtitle}
          </Typography>
        </div>

        {/* Video Section */}
        <div className="p-6">
          {!isVideoCompleted && !isVideoError ? (
            <div className="space-y-4">
              <Typography variant="h5" className="text-center text-gray-800 mb-4">
                Introduction Video
              </Typography>

              <div className="relative">
                <VideoPlayer
                  src={videoUrl}
                  className="w-full h-96 rounded-lg shadow-lg"
                  controls={true}
                  autoPlay={config.autoPlay}
                  muted={config.muted}
                  onError={handleVideoError}
                  onEnded={handleVideoEnd}
                />

                {/* Skip Button */}
                {showSkipButton && config.showSkipButton && (
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="outlined"
                      color="white"
                      className="bg-black bg-opacity-50 hover:bg-opacity-70 border-white text-white"
                      onClick={handleSkipVideo}
                    >
                      Skip Video
                    </Button>
                  </div>
                )}
              </div>

              <Typography variant="small" className="text-center text-gray-600">
                {config.description}
              </Typography>
            </div>
          ) : isVideoError ? (
            <div className="text-center space-y-4">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <Typography variant="h5" className="text-gray-800">
                Video Unavailable
              </Typography>
              <Typography variant="paragraph" className="text-gray-600">
                The introduction video is currently unavailable. You can continue to the application.
              </Typography>
              <Button
                color="green"
                size="lg"
                onClick={handleContinueToApp}
                className="mt-4"
              >
                Continue to Application
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <Typography variant="h5" className="text-gray-800">
                Welcome to CHM Lab!
              </Typography>
              <Typography variant="paragraph" className="text-gray-600">
                You're all set to explore the Chemistry Laboratory. Redirecting to the main application...
              </Typography>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center">
          <Typography variant="small" className="text-gray-500">
            © 2024 National Open University of Nigeria - ACETEL. All rights reserved.
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default IntroVideoScreen
