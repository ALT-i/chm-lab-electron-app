import React from 'react'
import VideoPlayer from './VideoPlayer'

/**
 * Example component showing how to integrate Google Drive video streaming
 * in your existing experiment/lesson structure
 */
const VideoExample: React.FC = () => {
  // Example Google Drive URLs from your API
  const exampleVideos = [
    {
      id: 1,
      title: 'Introduction to Chemistry Lab Safety',
      videoUrl: 'https://drive.google.com/file/d/1eMfYMfxbUpHxbYYjIh3vP52JRc0ALrUe/view?usp=drive_link',
      description: 'Learn about essential safety protocols in the chemistry laboratory.'
    },
    {
      id: 2,
      title: 'Basic Laboratory Equipment',
      videoUrl: 'https://drive.google.com/file/d/ANOTHER_FILE_ID/view?usp=drive_link',
      description: 'Overview of common laboratory equipment and their uses.'
    }
  ]

  const handleVideoError = (error: string, videoTitle: string) => {
    console.error(`Error loading video "${videoTitle}":`, error)
    // You can show a notification to the user here
    // or implement fallback content
  }

  const handleVideoLoad = (videoTitle: string) => {
    console.log(`Video "${videoTitle}" loaded successfully`)
    // You can track analytics or update UI state here
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Experiment Introduction Videos</h2>

      <div className="space-y-8">
        {exampleVideos.map((video) => (
          <div key={video.id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
            <p className="text-gray-600 mb-4">{video.description}</p>

            <div className="h-64">
              <VideoPlayer
                src={video.videoUrl}
                className="w-full h-full"
                controls={true}
                autoPlay={false}
                muted={true}
                onError={(error) => handleVideoError(error, video.title)}
                onLoad={() => handleVideoLoad(video.title)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Integration Notes:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Replace the example URLs with your actual Google Drive video URLs</li>
          <li>• Ensure all Google Drive files are set to "Anyone with the link can view"</li>
          <li>• The VideoPlayer component automatically handles URL conversion</li>
          <li>• Error handling provides user-friendly messages for common issues</li>
          <li>• Loading states give users feedback during video loading</li>
        </ul>
      </div>
    </div>
  )
}

export default VideoExample
