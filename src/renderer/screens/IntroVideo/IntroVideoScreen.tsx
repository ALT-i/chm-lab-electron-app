import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Typography } from '@material-tailwind/react'
import VideoPlayer from 'renderer/components/VideoPlayer'
import { getIntroVideoConfig } from 'renderer/utils/intro-video-config'
import { ds } from 'renderer/utils/design-system'

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
    <div className="min-h-screen bg-green-600 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
          <div className="bg-green-700 text-white p-8 text-center">
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <img
                  className="h-12 w-12 rounded-xl"
            src="./noun_logo.png"
            alt="NOUN Logo"
          />
              </div>
              <div className="text-center">
                <Typography className="text-3xl font-bold text-white mb-1">
                  {config.title}
                </Typography>
                <Typography className="text-green-100 font-medium">
                  {config.subtitle}
                </Typography>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
          <img
                  className="h-12 w-12 rounded-xl"
            src="./acetel_logo.png"
            alt="ACETEL Logo"
          />
        </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {!isVideoCompleted && !isVideoError ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Typography className="text-2xl font-bold text-gray-800 mb-3">
                    Welcome to Your Chemistry Lab
          </Typography>
                  <Typography className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                    {config.description}
          </Typography>
        </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative">
                <VideoPlayer
                  src={videoUrl}
                      className="w-full h-96 rounded-xl shadow-xl"
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
                          className="bg-black/70 hover:bg-black/90 text-white border-0 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      onClick={handleSkipVideo}
                    >
                          Skip Video →
                    </Button>
                  </div>
                )}
                  </div>
              </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Typography className="text-sm text-gray-500 font-medium">
                    Get ready for an amazing learning experience
              </Typography>
                </div>
            </div>
          ) : isVideoError ? (
              <div className="text-center space-y-6 py-12">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <Typography className="text-2xl font-bold text-gray-800">
                  Video Temporarily Unavailable
              </Typography>
                <Typography className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
                  Don't worry! You can continue to the application and watch the introduction video later from the About section.
              </Typography>
              <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleContinueToApp}
              >
                  Continue to Lab →
              </Button>
            </div>
          ) : (
              <div className="text-center space-y-6 py-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <Typography className="text-2xl font-bold text-gray-800">
                  Welcome to CHM Lab! 🧪
              </Typography>
                <Typography className="text-gray-600 text-lg leading-relaxed max-w-lg mx-auto">
                  You're all set to explore the Chemistry Laboratory. Get ready for hands-on experiments and interactive learning!
              </Typography>
              <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
                </div>
                <Typography className="text-sm text-gray-500 font-medium">
                  Redirecting to your laboratory...
                </Typography>
            </div>
          )}
        </div>

        {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <Typography className="text-center text-sm text-gray-500">
              © 2024 National Open University of Nigeria - ACETEL
          </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntroVideoScreen
