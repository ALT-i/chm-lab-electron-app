# Introductory Video Feature

This document explains the introductory video feature that plays every time a user logs into the CHM Lab application, and the enhanced About screen that includes comprehensive information and video access.

## Overview

The introductory video feature provides a welcoming experience for users by playing a video that introduces them to the Chemistry Lab application. The video plays automatically after successful login and before the user reaches the main application. Additionally, users can access the intro video and detailed application information through the enhanced About screen.

## Features

### ✅ Automatic Playbook
- Video plays automatically after login
- Only shows once per session (until logout)
- Supports Google Drive video URLs and direct video files

### ✅ Enhanced About Screen
- Comprehensive tabbed interface with four sections:
  - **Overview**: Application summary and key features
  - **Introduction Video**: Embedded intro video with learning objectives
  - **Features**: Detailed feature descriptions
  - **About NOUN**: Information about NOUN and ACETEL
- Modern, responsive design with Material Tailwind components
- Integrated into main application (no separate window)
- Accessible through the side panel menu with easy navigation
- Back button and breadcrumb navigation for better UX

### ✅ User Control & Access
- Skip button appears after 3 seconds (configurable)
- Video controls for play/pause/seek
- Replay option in side panel menu
- Direct access through About window
- Error handling with fallback options

### ✅ Session Management
- Tracks if user has seen the video for current session
- Resets on logout to show again on next login
- Manual replay functionality available
- Seamless navigation to main app after completion

### ✅ Multiple Access Points
- **Automatic**: On first login of each session
- **Side Panel**: "Intro Video" menu option for replay
- **About Screen**: Comprehensive "/about" route with embedded video
- **Programmatic**: Utility functions for developers

## How It Works

### 1. Login Flow
When a user successfully logs in:
1. The system checks if `intro_video_seen` flag is set in localStorage
2. If not set, user is redirected to `/intro-video` route
3. If already set, user goes directly to `/home`

### 2. Video Playback
- Video starts playing automatically (configurable)
- Skip button appears after configured delay
- User can skip or watch the entire video

### 3. Completion
- When video ends or user skips, `intro_video_seen` flag is set
- User is automatically redirected to the main application
- Flag persists until logout

### 4. Logout Reset
When user logs out:
- `intro_video_seen` flag is cleared
- User will see intro video again on next login

### 5. Manual Replay
Users can replay the intro video through:
- Side panel "Intro Video" menu option
- About screen "Introduction Video" tab
- Utility functions (for developers)

## Enhanced About Screen

The About screen now provides comprehensive information about the CHM Lab application in a beautiful, tabbed interface:

### Overview Tab
- Application summary with version information
- Key feature highlights in visual cards
- System information (version, platform, framework, license)
- Quick overview of capabilities

### Introduction Video Tab
- Embedded intro video player
- Learning objectives and benefits
- Same video used in the automatic intro experience
- User-friendly interface with controls

### Features Tab
- Detailed feature descriptions with visual indicators
- Color-coded feature categories
- Comprehensive overview of all capabilities
- Benefits and use cases for each feature

### About NOUN Tab
- Information about NOUN and ACETEL
- Mission statement and objectives
- Visual representation of goals and reach
- Educational context and background

## Access Methods

### 1. Automatic Intro Video
```typescript
// Triggered automatically on login if not seen
// Redirects to /intro-video route
navigate('/intro-video')
```

### 2. Side Panel Menu
```typescript
// Available in the side panel for logged-in users
function replayIntroVideo() {
  window.localStorage.removeItem('intro_video_seen')
  navigate('/intro-video')
}
```

### 3. About Screen
```typescript
// Navigate to About screen within the main app
function openAboutScreen() {
  navigate('/about')
}
```

### 4. Utility Functions
```typescript
import { 
  clearIntroVideoFlag, 
  hasSeenIntroVideo, 
  getIntroVideoConfig 
} from 'renderer/utils/intro-video-config'

// Check if user has seen video
const hasSeen = hasSeenIntroVideo()

// Force replay by clearing flag
clearIntroVideoFlag()

// Get current configuration
const config = getIntroVideoConfig()
```

## Configuration

The intro video can be customized through the configuration file:

```typescript
// src/renderer/utils/intro-video-config.ts
export const introVideoConfig: IntroVideoConfig = {
  videoUrl: 'https://drive.google.com/file/d/YOUR_VIDEO_ID/view?usp=drive_link',
  showSkipButton: true,
  skipButtonDelay: 3000,
  autoPlay: true,
  muted: false,
  title: 'Welcome to CHM Lab',
  subtitle: 'National Open University of Nigeria (NOUN) - ACETEL',
  description: 'This video will help you get started with the Chemistry Lab application'
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `videoUrl` | string | Google Drive URL | URL of the introductory video |
| `showSkipButton` | boolean | true | Whether to show skip button |
| `skipButtonDelay` | number | 3000 | Delay before showing skip button (ms) |
| `autoPlay` | boolean | true | Whether video should auto-play |
| `muted` | boolean | false | Whether video should be muted initially |
| `title` | string | "Welcome to CHM Lab" | Main title on the screen |
| `subtitle` | string | "NOUN - ACETEL" | Subtitle text |
| `description` | string | Help text | Description below the video |

## Video Requirements

### Supported Formats
- MP4 (recommended)
- WebM
- OGG

### Google Drive Integration
The feature supports Google Drive video URLs:
- Standard shareable links
- Direct download links
- Open links

### File Requirements
- Video must be set to "Anyone with the link can view"
- Recommended resolution: 1920x1080 or lower
- Recommended file size: Under 100MB for better loading

## Implementation Details

### Routes
```typescript
// src/renderer/routes.tsx
<Route path="/intro-video" element={<IntroVideoScreen />} />
```

### Components
- `IntroVideoScreen`: Main intro video component
- `VideoPlayer`: Enhanced video player with Google Drive support
- Configuration utilities for easy customization

### State Management
- Uses localStorage to track video completion
- Session-based tracking (resets on logout)
- Automatic cleanup on logout

## Customization Examples

### Change Video URL
```typescript
import { updateIntroVideoConfig } from 'renderer/utils/intro-video-config'

updateIntroVideoConfig({
  videoUrl: 'https://your-custom-video-url.com/video.mp4'
})
```

### Disable Skip Button
```typescript
updateIntroVideoConfig({
  showSkipButton: false
})
```

### Custom Styling
The intro video screen uses Tailwind CSS classes and can be customized by modifying the component styles in `src/renderer/screens/IntroVideo/index.tsx`.

### Custom Titles
```typescript
updateIntroVideoConfig({
  title: 'Welcome to Chemistry Lab',
  subtitle: 'Your Institution Name',
  description: 'Custom description text'
})
```

## Error Handling

The feature includes comprehensive error handling:

### Video Loading Errors
- Shows user-friendly error message
- Provides "Continue to Application" button
- Logs detailed error information for debugging

### Network Issues
- Graceful fallback when video can't be loaded
- Clear instructions for users
- Automatic retry mechanisms

### Google Drive Specific
- Special error messages for Google Drive issues
- Tips for fixing sharing permissions
- Fallback options

## Testing

### Manual Testing
1. Log in to the application
2. Verify intro video plays (first time)
3. Skip video and verify navigation to main app
4. Log out and log back in
5. Verify intro video plays again

### Automated Testing
The feature can be tested by:
- Checking localStorage flags
- Verifying navigation flows
- Testing error scenarios
- Validating video playback

## Troubleshooting

### Video Won't Play
1. Check if Google Drive file is publicly accessible
2. Verify URL format is correct
3. Check browser console for errors
4. Ensure video format is supported

### Skip Button Not Appearing
1. Check `showSkipButton` configuration
2. Verify `skipButtonDelay` setting
3. Check for JavaScript errors

### Navigation Issues
1. Verify route is properly configured
2. Check localStorage for flag values
3. Ensure logout properly clears flags

### About Screen Issues
1. Check if Material Tailwind components are properly loaded
2. Verify video URL is accessible
3. Ensure tab navigation is working correctly

## Future Enhancements

- [ ] Support for multiple video sources
- [ ] Video quality selection
- [ ] Analytics tracking for video engagement
- [ ] Custom video controls
- [ ] Offline video caching
- [ ] A/B testing support
- [ ] User preference settings
- [ ] Multi-language video support
- [ ] Video progress tracking
- [ ] Interactive video elements

## Support

For issues with the intro video feature or About screen:
1. Check the browser console for error messages
2. Verify video URL and permissions
3. Test with different video formats
4. Review configuration settings
5. Ensure Material Tailwind CSS is properly loaded
6. Test About window functionality separately

## Development Notes

### Adding New Tabs to About Screen
To add new tabs to the About screen:

```typescript
const tabsData = [
  // ... existing tabs
  {
    label: 'New Tab',
    value: 'new-tab',
    icon: '🆕',
  },
]
```

### Customizing About Content
Modify the content in the respective TabPanel components in `src/renderer/screens/About/index.tsx`.

### Testing
- Test intro video on fresh login
- Test About window accessibility
- Test video playback in both contexts
- Verify responsive design on different screen sizes
- Test all navigation flows and error states
