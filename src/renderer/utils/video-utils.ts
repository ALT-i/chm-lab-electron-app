/**
 * Utility functions for handling video URLs, specifically Google Drive video streaming
 */

/**
 * Converts a Google Drive shareable link to a direct streaming URL
 * @param driveUrl - The Google Drive shareable URL
 * @returns The direct streaming URL for the video
 */
export function convertGoogleDriveUrl(driveUrl: string): string {
  // Check if it's a Google Drive URL
  if (!driveUrl.includes('drive.google.com')) {
    return driveUrl // Return as-is if not a Google Drive URL
  }

  // Handle different Google Drive URL formats
  let fileId: string | null = null

  // Format 1: /file/d/{fileId}/view
  const format1Match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
  if (format1Match) {
    fileId = format1Match[1]
  }

  // Format 2: /open?id={fileId}
  if (!fileId) {
    const format2Match = driveUrl.match(/\/open\?id=([a-zA-Z0-9-_]+)/)
    if (format2Match) {
      fileId = format2Match[1]
    }
  }

  // Format 3: /uc?id={fileId}
  if (!fileId) {
    const format3Match = driveUrl.match(/\/uc\?id=([a-zA-Z0-9-_]+)/)
    if (format3Match) {
      fileId = format3Match[1]
    }
  }

  if (!fileId) {
    console.warn('Invalid Google Drive URL format:', driveUrl)
    return driveUrl
  }

  // Return the direct streaming URL with multiple fallback options
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

/**
 * Checks if a URL is a Google Drive shareable link
 * @param url - The URL to check
 * @returns True if it's a Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com')
}

/**
 * Gets alternative streaming URLs for Google Drive videos
 * @param fileId - The Google Drive file ID
 * @returns Array of alternative streaming URLs
 */
export function getGoogleDriveStreamingUrls(fileId: string): string[] {
  return [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://drive.google.com/file/d/${fileId}/preview`,
    `https://drive.google.com/uc?id=${fileId}&export=download`,
  ]
}

/**
 * Validates if a Google Drive URL is properly formatted
 * @param url - The URL to validate
 * @returns True if the URL is valid
 */
export function isValidGoogleDriveUrl(url: string): boolean {
  if (!isGoogleDriveUrl(url)) {
    return false
  }

  // Check if it matches any of the known formats
  const formats = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /\/open\?id=([a-zA-Z0-9-_]+)/,
    /\/uc\?id=([a-zA-Z0-9-_]+)/,
  ]

  return formats.some((format) => format.test(url))
}

/**
 * Gets the appropriate video source URL for streaming
 * @param videoUrl - The original video URL (could be Google Drive or direct)
 * @returns The processed URL ready for video streaming
 */
export function getVideoStreamUrl(videoUrl: string): string {
  if (!videoUrl) {
    return ''
  }

  if (isGoogleDriveUrl(videoUrl)) {
    return convertGoogleDriveUrl(videoUrl)
  }

  return videoUrl
}
