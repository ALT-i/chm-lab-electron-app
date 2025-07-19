# Google Drive Video Streaming Implementation

This document explains how to implement Google Drive video streaming in your Electron app for introductory videos per experiment/lesson.

## Overview

The implementation provides a robust solution for streaming videos from Google Drive shareable links directly in your Electron application. It includes:

- URL conversion utilities for Google Drive links
- A custom VideoPlayer component with error handling
- Support for multiple Google Drive URL formats
- Loading states and user-friendly error messages

## Features

### ✅ Supported Google Drive URL Formats

1. **Standard Shareable Link**: `https://drive.google.com/file/d/{fileId}/view?usp=drive_link`
2. **Open Link**: `https://drive.google.com/open?id={fileId}`
3. **Direct Download**: `https://drive.google.com/uc?id={fileId}&export=download`

### ✅ Video Player Features

- Automatic URL conversion for Google Drive links
- Loading states with spinner animation
- Comprehensive error handling with specific messages
- Support for multiple video formats (MP4, WebM, OGG)
- Responsive design with Tailwind CSS
- Google Drive-specific error messages and tips

## Implementation

### 1. Video Utilities (`src/renderer/utils/video-utils.ts`)

```typescript
import { getVideoStreamUrl, convertGoogleDriveUrl, isGoogleDriveUrl } from '../utils/video-utils'

// Convert any Google Drive URL to streaming format
const streamingUrl = getVideoStreamUrl('https://drive.google.com/file/d/1eMfYMfxbUpHxbYYjIh3vP52JRc0ALrUe/view?usp=drive_link')

// Check if URL is from Google Drive
const isDriveUrl = isGoogleDriveUrl(videoUrl)
```

### 2. Video Player Component (`src/renderer/components/VideoPlayer.tsx`)

```typescript
import VideoPlayer from '../components/VideoPlayer'

<VideoPlayer
  src={classVideo}
  className="h-full w-full mb-5"
  controls={true}
  autoPlay={false}
  muted={true}
  onError={(error) => console.error('Video error:', error)}
  onLoad={() => console.log('Video loaded successfully')}
/>
```

### 3. Integration in Instructions Panel

The `InstructionsPanel.tsx` component has been updated to use the new `VideoPlayer`:

```typescript
// Before (basic HTML5 video)
<video className="h-full w-full mb-5 rounded-lg" controls autoPlay={false} muted>
  <source src={classVideo} type="video/mp4" />
  Error fetching demo video.
</video>

// After (enhanced VideoPlayer)
<VideoPlayer
  src={classVideo}
  className="h-full w-full mb-5"
  controls={true}
  autoPlay={false}
  muted={true}
  onError={(error) => console.error('Video error:', error)}
/>
```

## Usage Examples

### Basic Implementation

```typescript
import VideoPlayer from '../components/VideoPlayer'

function MyComponent() {
  const googleDriveUrl = 'https://drive.google.com/file/d/1eMfYMfxbUpHxbYYjIh3vP52JRc0ALrUe/view?usp=drive_link'
  
  return (
    <VideoPlayer
      src={googleDriveUrl}
      className="w-full h-64"
      controls={true}
    />
  )
}
```

### With Error Handling

```typescript
import VideoPlayer from '../components/VideoPlayer'

function MyComponent() {
  const handleVideoError = (error: string) => {
    console.error('Video failed to load:', error)
    // Show user notification or fallback content
  }

  const handleVideoLoad = () => {
    console.log('Video loaded successfully')
    // Update UI state or analytics
  }

  return (
    <VideoPlayer
      src={googleDriveUrl}
      onError={handleVideoError}
      onLoad={handleVideoLoad}
    />
  )
}
```

## API Integration

When your API returns video URLs, they can be passed directly to the `VideoPlayer` component:

```typescript
// API response example
const apiResponse = {
  data: {
    video_file: 'https://drive.google.com/file/d/1eMfYMfxbUpHxbYYjIh3vP52JRc0ALrUe/view?usp=drive_link'
  }
}

// Direct usage in component
<VideoPlayer src={apiResponse.data.video_file} />
```

## Important Requirements

### Google Drive File Settings

For videos to stream properly, ensure your Google Drive files are configured correctly:

1. **Sharing Settings**: Set to "Anyone with the link can view"
2. **File Size**: Consider file size limitations for streaming
3. **File Format**: Supported formats include MP4, WebM, OGG

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Good support
- **Safari**: May have limitations with certain Google Drive URLs

## Error Handling

The VideoPlayer component provides comprehensive error handling:

### Common Error Scenarios

1. **Network Errors**: Connection issues or slow internet
2. **Access Denied**: File not publicly accessible
3. **Format Not Supported**: Unsupported video format
4. **File Not Found**: Invalid or deleted file

### Error Messages

- Generic errors show technical details
- Google Drive errors include specific troubleshooting tips
- User-friendly messages guide users to solutions

## Testing

Use the `VideoTestComponent` to test different Google Drive URL formats:

```typescript
import VideoTestComponent from '../components/VideoTestComponent'

// Add to your routes or test page
<VideoTestComponent />
```

## Performance Considerations

1. **Caching**: Videos are cached by the browser
2. **Progressive Loading**: Videos load progressively
3. **Error Recovery**: Automatic retry mechanisms
4. **Memory Management**: Proper cleanup on component unmount

## Troubleshooting

### Video Won't Load

1. Check if the Google Drive file is publicly accessible
2. Verify the URL format is correct
3. Check browser console for specific error messages
4. Try refreshing the page

### Poor Performance

1. Consider video compression
2. Use appropriate video formats (MP4 recommended)
3. Check internet connection speed
4. Consider hosting on dedicated video services for production

## Future Enhancements

- [ ] Support for YouTube video URLs
- [ ] Video quality selection
- [ ] Custom video controls
- [ ] Analytics integration
- [ ] Offline video caching
- [ ] Multiple video source fallbacks

## Support

For issues or questions about video streaming implementation:

1. Check the browser console for error messages
2. Verify Google Drive file permissions
3. Test with different URL formats
4. Review the error handling documentation 
