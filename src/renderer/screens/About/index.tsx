import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container } from 'renderer/components'
import VideoPlayer from 'renderer/components/VideoPlayer'
import { getIntroVideoConfig } from 'renderer/utils/intro-video-config'
import {
  Typography,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Chip,
  Button,
  IconButton
} from '@material-tailwind/react'

// Get version from environment or use a default
const APP_VERSION = process.env.npm_package_version || '0.9.5'

export function AboutScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const config = getIntroVideoConfig()

  const tabsData = [
    {
      label: 'Overview',
      value: 'overview',
      icon: '🏠',
    },
    {
      label: 'Introduction Video',
      value: 'video',
      icon: '🎥',
    },
    {
      label: 'Features',
      value: 'features',
      icon: '⚡',
    },
    {
      label: 'About NOUN',
      value: 'noun',
      icon: '🎓',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 overflow-hidden">
      <div className="h-screen overflow-y-auto p-4">
        <Container>
          <Card className="w-full max-w-6xl mx-auto my-4">
            <CardBody className="p-6">
              {/* Navigation Header */}
              <div className="flex items-center justify-between mb-6">
                <IconButton
                  variant="text"
                  size="lg"
                  onClick={() => navigate(-1)}
                  className="text-green-700 hover:bg-green-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                </IconButton>

                <Typography variant="h5" color="green" className="font-bold">
                  About CHM Lab
                </Typography>

                <Button
                  size="sm"
                  variant="outlined"
                  color="green"
                  onClick={() => navigate('/home')}
                  className="hidden md:flex"
                >
                  Back to Home
                </Button>
              </div>

              {/* Main Header */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <img
                    className="h-16 w-16 rounded-full"
                    src="./noun_logo.png"
                    alt="NOUN Logo"
                  />
                  <div className="text-center">
                    <Typography variant="h4" color="green" className="font-bold">
                      CHM Lab v{APP_VERSION}
                    </Typography>
                    <Typography variant="small" color="gray" className="font-medium">
                      Virtual Chemistry Laboratory
                    </Typography>
                  </div>
                  <img
                    className="h-16 w-16 rounded-full"
                    src="./acetel_logo.png"
                    alt="ACETEL Logo"
                  />
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} className="w-full">
                <TabsHeader className="grid w-full grid-cols-4 bg-gray-100">
                  {tabsData.map(({ label, value, icon }) => (
                    <Tab
                      key={value}
                      value={value}
                      onClick={() => setActiveTab(value)}
                      className={`${
                        activeTab === value
                          ? 'bg-green-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-200 hover:text-green-700'
                      } transition-all duration-200 font-medium`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="font-medium">{label}</span>
                      </div>
                    </Tab>
                  ))}
                </TabsHeader>

                <TabsBody className="mt-6 max-h-[70vh] overflow-y-auto">
                  {/* Overview Tab */}
                  <TabPanel key="overview" value="overview" className="p-4 space-y-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <Typography variant="h5" color="green" className="mb-2">
                          Welcome to CHM Lab
                        </Typography>
                        <Typography variant="paragraph" color="gray" className="text-lg">
                          An advanced virtual chemistry laboratory for enhanced learning
                        </Typography>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-green-50">
                          <CardBody className="text-center p-4">
                            <div className="text-4xl mb-3">🧪</div>
                            <Typography variant="h6" color="green" className="mb-2">
                              Virtual Experiments
                            </Typography>
                            <Typography variant="small" color="gray">
                              Conduct chemistry experiments safely in a virtual environment
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="bg-blue-50">
                          <CardBody className="text-center p-4">
                            <div className="text-4xl mb-3">📚</div>
                            <Typography variant="h6" color="blue" className="mb-2">
                              Interactive Learning
                            </Typography>
                            <Typography variant="small" color="gray">
                              Hands-on learning with real-time feedback and guidance
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="bg-purple-50">
                          <CardBody className="text-center p-4">
                            <div className="text-4xl mb-3">🎯</div>
                            <Typography variant="h6" color="purple" className="mb-2">
                              Skill Assessment
                            </Typography>
                            <Typography variant="small" color="gray">
                              Track progress with quizzes and practical assessments
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="bg-orange-50">
                          <CardBody className="text-center p-4">
                            <div className="text-4xl mb-3">💡</div>
                            <Typography variant="h6" color="orange" className="mb-2">
                              Smart Guidance
                            </Typography>
                            <Typography variant="small" color="gray">
                              Step-by-step instructions and safety protocols
                            </Typography>
                          </CardBody>
                        </Card>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <Typography variant="h6" color="gray" className="mb-3 text-center">
                          System Information
                        </Typography>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <Typography variant="small" color="gray" className="font-semibold">
                              Version
                            </Typography>
                            <Chip value={APP_VERSION} color="green" size="sm" />
                          </div>
                          <div>
                            <Typography variant="small" color="gray" className="font-semibold">
                              Platform
                            </Typography>
                            <Chip value="Electron" color="blue" size="sm" />
                          </div>
                          <div>
                            <Typography variant="small" color="gray" className="font-semibold">
                              Framework
                            </Typography>
                            <Chip value="React" color="purple" size="sm" />
                          </div>
                          <div>
                            <Typography variant="small" color="gray" className="font-semibold">
                              License
                            </Typography>
                            <Chip value="MIT" color="orange" size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>

                  {/* Video Tab */}
                  <TabPanel key="video" value="video" className="p-4 space-y-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <Typography variant="h5" color="green" className="mb-2">
                          Introduction Video
                        </Typography>
                        <Typography variant="paragraph" color="gray">
                          Watch this introductory video to get started with CHM Lab
                        </Typography>
                      </div>

                      <div className="relative">
                        <VideoPlayer
                          src={config.videoUrl}
                          className="w-full h-96 rounded-lg shadow-lg"
                          controls={true}
                          autoPlay={false}
                          muted={true}
                          onError={(error) => console.error('About video error:', error)}
                        />
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <Typography variant="h6" color="blue" className="mb-2">
                          What you'll learn:
                        </Typography>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <Typography variant="small" color="gray">
                              How to navigate the virtual laboratory
                            </Typography>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <Typography variant="small" color="gray">
                              Understanding safety protocols and procedures
                            </Typography>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <Typography variant="small" color="gray">
                              Using laboratory equipment and instruments
                            </Typography>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <Typography variant="small" color="gray">
                              Conducting experiments and recording observations
                            </Typography>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </TabPanel>

                  {/* Features Tab */}
                  <TabPanel key="features" value="features" className="p-4 space-y-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <Typography variant="h5" color="green" className="mb-2">
                          Key Features
                        </Typography>
                        <Typography variant="paragraph" color="gray">
                          Discover the powerful features that make CHM Lab unique
                        </Typography>
                      </div>

                      <div className="space-y-4">
                        <Card className="border-l-4 border-green-500">
                          <CardBody className="p-4">
                            <Typography variant="h6" color="green" className="mb-2">
                              🧪 Virtual Laboratory Environment
                            </Typography>
                            <Typography variant="small" color="gray">
                              Fully immersive 3D laboratory with realistic equipment, chemicals, and safety protocols.
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="border-l-4 border-blue-500">
                          <CardBody className="p-4">
                            <Typography variant="h6" color="blue" className="mb-2">
                              📖 Interactive Experiments
                            </Typography>
                            <Typography variant="small" color="gray">
                              Step-by-step guided experiments with real-time feedback and educational content.
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="border-l-4 border-purple-500">
                          <CardBody className="p-4">
                            <Typography variant="h6" color="purple" className="mb-2">
                              🎯 Assessment & Quizzes
                            </Typography>
                            <Typography variant="small" color="gray">
                              Comprehensive testing system to evaluate understanding and practical skills.
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="border-l-4 border-orange-500">
                          <CardBody className="p-4">
                            <Typography variant="h6" color="orange" className="mb-2">
                              📊 Progress Tracking
                            </Typography>
                            <Typography variant="small" color="gray">
                              Monitor learning progress with detailed analytics and performance reports.
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="border-l-4 border-red-500">
                          <CardBody className="p-4">
                            <Typography variant="h6" color="red" className="mb-2">
                              🔒 Safety First
                            </Typography>
                            <Typography variant="small" color="gray">
                              Learn proper safety procedures without real-world risks in a controlled environment.
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="border-l-4 border-teal-500">
                          <CardBody className="p-4">
                            <Typography variant="h6" color="teal" className="mb-2">
                              🎥 Multimedia Learning
                            </Typography>
                            <Typography variant="small" color="gray">
                              Rich multimedia content including videos, animations, and interactive tutorials.
                            </Typography>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </TabPanel>

                  {/* About NOUN Tab */}
                  <TabPanel key="noun" value="noun" className="p-4 space-y-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <Typography variant="h5" color="green" className="mb-2">
                          About NOUN & ACETEL
                        </Typography>
                        <Typography variant="paragraph" color="gray">
                          Leading the future of technology-enhanced learning
                        </Typography>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-green-50">
                          <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                              <img
                                className="h-12 w-12 rounded-full mr-3"
                                src="./noun_logo.png"
                                alt="NOUN Logo"
                              />
                              <Typography variant="h6" color="green">
                                National Open University of Nigeria
                              </Typography>
                            </div>
                            <Typography variant="small" color="gray" className="leading-relaxed">
                              NOUN is Nigeria's premier open and distance learning institution,
                              committed to providing accessible, quality education to learners
                              across Nigeria and beyond. Established to democratize education,
                              NOUN leverages technology to deliver innovative learning solutions.
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="bg-blue-50">
                          <CardBody className="p-6">
                            <div className="flex items-center mb-4">
                              <img
                                className="h-12 w-12 rounded-full mr-3"
                                src="./acetel_logo.png"
                                alt="ACETEL Logo"
                              />
                              <Typography variant="h6" color="blue">
                                ACETEL
                              </Typography>
                            </div>
                            <Typography variant="small" color="gray" className="leading-relaxed">
                              The Africa Centre of Excellence on Technology Enhanced Learning (ACETEL)
                              is a World Bank-funded initiative focused on advancing technology-enhanced
                              learning across Africa. ACETEL develops innovative educational technologies
                              and pedagogical approaches.
                            </Typography>
                          </CardBody>
                        </Card>
                      </div>

                      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                        <CardBody className="p-6">
                          <Typography variant="h6" color="gray" className="mb-4 text-center">
                            Our Mission
                          </Typography>
                          <Typography variant="paragraph" color="gray" className="text-center leading-relaxed">
                            To revolutionize science education through innovative virtual laboratory
                            technologies, making quality practical learning accessible to students
                            across Africa and beyond. We believe in the power of technology to
                            transform education and create opportunities for lifelong learning.
                          </Typography>
                        </CardBody>
                      </Card>

                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="text-center bg-white">
                          <CardBody className="p-4">
                            <div className="text-3xl mb-2">🌍</div>
                            <Typography variant="h6" color="green" className="mb-1">
                              Global Reach
                            </Typography>
                            <Typography variant="small" color="gray">
                              Serving students across Africa
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="text-center bg-white">
                          <CardBody className="p-4">
                            <div className="text-3xl mb-2">🔬</div>
                            <Typography variant="h6" color="blue" className="mb-1">
                              Innovation
                            </Typography>
                            <Typography variant="small" color="gray">
                              Cutting-edge educational technology
                            </Typography>
                          </CardBody>
                        </Card>

                        <Card className="text-center bg-white">
                          <CardBody className="p-4">
                            <div className="text-3xl mb-2">🎓</div>
                            <Typography variant="h6" color="purple" className="mb-1">
                              Excellence
                            </Typography>
                            <Typography variant="small" color="gray">
                              Quality education for all
                            </Typography>
                          </CardBody>
                        </Card>
                      </div>
                    </div>
                  </TabPanel>
                </TabsBody>
              </Tabs>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <Typography variant="small" color="gray">
                  © 2024 National Open University of Nigeria - ACETEL. All rights reserved.
                </Typography>
                <Typography variant="small" color="gray" className="mt-1">
                  Developed with ❤️ for enhanced learning experiences
                </Typography>
              </div>
            </CardBody>
          </Card>
        </Container>
      </div>
    </div>
  )
}
