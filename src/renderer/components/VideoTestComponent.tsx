import React, { useState } from 'react'
import VideoPlayer from './VideoPlayer'
import { convertGoogleDriveUrl, isValidGoogleDriveUrl } from '../utils/video-utils'

const VideoTestComponent: React.FC = () => {
  const [testUrl, setTestUrl] = useState('')
  const [convertedUrl, setConvertedUrl] = useState('')
  const [isValid, setIsValid] = useState(false)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setTestUrl(url)

    if (url) {
      const valid = isValidGoogleDriveUrl(url)
      setIsValid(valid)

      if (valid) {
        const converted = convertGoogleDriveUrl(url)
        setConvertedUrl(converted)
      } else {
        setConvertedUrl('')
      }
    } else {
      setIsValid(false)
      setConvertedUrl('')
    }
  }

  const sampleUrls = [
    'https://drive.google.com/file/d/1eMfYMfxbUpHxbYYjIh3vP52JRc0ALrUe/view?usp=drive_link',
    'https://drive.google.com/open?id=1eMfYMfxbUpHxbYYjIh3vP52JRc0ALrUe',
    'https://drive.google.com/uc?id=1eMfYMfxbUpHxbYYjIh3vP52JRc0ALrUe&export=download'
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Google Drive Video Streaming Test</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Enter Google Drive URL:
        </label>
        <input
          type="text"
          value={testUrl}
          onChange={handleUrlChange}
          placeholder="https://drive.google.com/file/d/..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />

        {testUrl && (
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded text-sm ${
              isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isValid ? '✓ Valid Google Drive URL' : '✗ Invalid Google Drive URL'}
            </span>
          </div>
        )}

        {convertedUrl && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-800">Converted URL:</p>
            <p className="text-xs text-blue-600 break-all">{convertedUrl}</p>
          </div>
        )}
      </div>

      {isValid && convertedUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Video Player Test:</h3>
          <div className="h-64">
            <VideoPlayer
              src={testUrl}
              className="w-full h-full"
              controls={true}
              autoPlay={false}
              muted={true}
              onError={(error) => console.error('Video error:', error)}
            />
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Sample Google Drive URLs:</h3>
        <div className="space-y-2">
          {sampleUrls.map((url, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded">
              <p className="text-sm font-medium">Format {index + 1}:</p>
              <p className="text-xs text-gray-600 break-all">{url}</p>
              <button
                onClick={() => setTestUrl(url)}
                className="mt-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Use This URL
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notes:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Google Drive files must be set to "Anyone with the link can view"</li>
          <li>• Large video files may take time to load</li>
          <li>• Some browsers may have limitations with Google Drive streaming</li>
          <li>• For production use, consider hosting videos on a dedicated video service</li>
        </ul>
      </div>
    </div>
  )
}

export default VideoTestComponent
