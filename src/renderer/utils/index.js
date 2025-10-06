import React from 'react'

const server = {
  absolute_url: 'http://localhost:8001',
  // absolute_url: 'https://chem-lab-backend.onrender.com',
  ip: '',
  auth_signin: 'api/v1/login/',
  auth_signup: 'api/v1/register/',
  user: 'api/v1/users',
  workbench: 'api/v1/workbench',
  workspace: 'api/v1/workspace/lessons',
  moodle_students: 'api/v1/moodle/students/',
  moodle_user_profile: 'api/v1/moodle/user/profile/',
  moodle_assignment_grades: 'api/v1/moodle/grades/assignment/',
  stack: ['react', 'python', 'electron.js'],
}

// Export video utilities
export * from './video-utils'

export function getAuthHeader() {
  const tokensRaw =
    window.localStorage.getItem('auth_tokens') ||
    window.localStorage.getItem('tokens')
  if (!tokensRaw) return {}
  try {
    const tokens = JSON.parse(tokensRaw)
    if (tokens && tokens.access) {
      return { Authorization: `Bearer ${tokens.access}` }
    }
  } catch (e) {
    // ignore parse error
  }
  return {}
}

export default server
