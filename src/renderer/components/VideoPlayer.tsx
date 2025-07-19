import React, { useState, useRef, useEffect } from 'react'
import { getVideoStreamUrl, isGoogleDriveUrl } from '../utils/video-utils'

interface VideoPlayerProps {
  src: string
  className?: string
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  onError?: (error: string) => void
  onLoad?: () => void
  onEnded?: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = '',
  controls = true,
  autoPlay = false,
  muted = true,
  onError,
  onLoad,
  onEnded,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  const processedSrc = getVideoStreamUrl(src)

  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setErrorMessage('')
  }, [src])

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setIsLoading(false)
    setHasError(true)

    const video = event.currentTarget
    let errorMsg = 'Failed to load video'

    if (video.error) {
      switch (video.error.code) {
        case 1:
          errorMsg = 'Video loading was aborted'
          break
        case 2:
          errorMsg = 'Network error occurred while loading video'
          break
        case 3:
          errorMsg = 'Video decoding failed'
          break
        case 4:
          errorMsg = 'Video format not supported'
          break
        default:
          errorMsg = 'Unknown video error occurred'
      }
    }

    // Special handling for Google Drive videos
    if (isGoogleDriveUrl(src)) {
      errorMsg = 'Unable to stream Google Drive video. Please check if the file is publicly accessible.'
    }

    setErrorMessage(errorMsg)
    onError?.(errorMsg)
  }

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-500">No video source provided</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-2 text-sm text-gray-600">Loading video...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg min-h-[200px]">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-red-600 font-medium">Video Error</p>
            <p className="text-gray-600 text-sm mt-1">{errorMessage}</p>
            {isGoogleDriveUrl(src) && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <p><strong>Google Drive Tip:</strong></p>
                <p>• Ensure the video file is set to "Anyone with the link can view"</p>
                <p>• Try refreshing the page or check your internet connection</p>
              </div>
            )}
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className={`w-full h-full rounded-lg ${hasError ? 'hidden' : ''}`}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={onEnded}
      >
        <source src={processedSrc} type="video/mp4" />
        <source src={processedSrc} type="video/webm" />
        <source src={processedSrc} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default VideoPlayer
