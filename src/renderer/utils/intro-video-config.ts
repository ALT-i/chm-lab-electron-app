/**
 * Configuration for the introductory video
 */

export interface IntroVideoConfig {
  /** The URL of the introductory video (supports Google Drive URLs) */
  videoUrl: string
  /** Whether to show the skip button (appears after 3 seconds) */
  showSkipButton: boolean
  /** Delay before showing skip button in milliseconds */
  skipButtonDelay: number
  /** Whether to auto-play the video */
  autoPlay: boolean
  /** Whether the video should be muted initially */
  muted: boolean
  /** Title shown on the intro video screen */
  title: string
  /** Subtitle shown on the intro video screen */
  subtitle: string
  /** Description text shown below the video */
  description: string
}

export const introVideoConfig: IntroVideoConfig = {
  videoUrl:
    'https://media.sideproject.pamilerin.com.ng/CHM%20LAB/Introduction.mp4',
  showSkipButton: true,
  skipButtonDelay: 3000,
  autoPlay: true,
  muted: false,
  title: 'Welcome to CHM Lab',
  subtitle: 'National Open University of Nigeria (NOUN) - ACETEL',
  description:
    'This video will help you get started with the Chemistry Lab application',
}

/**
 * Get the intro video configuration
 * @returns The intro video configuration object
 */
export function getIntroVideoConfig(): IntroVideoConfig {
  return introVideoConfig
}

/**
 * Update the intro video configuration
 * @param config - Partial configuration to update
 */
export function updateIntroVideoConfig(
  config: Partial<IntroVideoConfig>
): void {
  Object.assign(introVideoConfig, config)
}

/**
 * Clear the intro video seen flag to force replay
 * Useful for testing or when user wants to watch again
 */
export function clearIntroVideoFlag(): void {
  window.localStorage.removeItem('intro_video_seen')
}

/**
 * Check if user has seen the intro video for current session
 * @returns boolean indicating if video has been seen
 */
export function hasSeenIntroVideo(): boolean {
  return window.localStorage.getItem('intro_video_seen') === 'true'
}
