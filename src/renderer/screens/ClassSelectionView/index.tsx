import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Button, Card, CardBody } from '@material-tailwind/react'
import axios from 'axios'

import SectionSidePanel from 'renderer/components/sections/SectionSidePanel'
import { ds } from 'renderer/utils/design-system'
import server from 'renderer/utils'

interface Experiment {
  id: number
  title: string
  description?: string
  instructions?: string
  level?: string
  duration?: string
  tools?: any[]
  substances?: any[]
  procedure?: any[]
  video_file?: string
  image?: string
}

export function ClassSelectionView() {
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [experimentsPerPage] = useState(6)
  const navigate = useNavigate()

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen)
  }

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch experiments from the API
        const response = await axios.get(`${server.absolute_url}/${server.workspace}/?limit=100`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.data && response.data.data && response.data.data.results) {
          const experimentsData = response.data.data.results
            .map((item: any) => ({
              id: item.id,
              title: item.title || `Experiment ${item.id}`,
              description: item.instructions ?
                item.instructions.replace(/<[^>]*>/g, '').substring(0, 120) + '...' :
                'Click to view detailed instructions and begin your chemistry experiment.',
              level: item.level || 'Intermediate',
              duration: item.duration || '45-60 min',
              tools: item.tools || [],
              substances: item.substances || [],
              procedure: item.procedure || [],
              video_file: item.video_file,
              image: item.image || item.thumbnail || './real_chemLab_bg.jpg', // Fallback to default lab image
            }))
            .sort((a: Experiment, b: Experiment) => a.id - b.id) // Sort by ID ascending

          setExperiments(experimentsData)

          // Cache the experiments data
          window.localStorage.setItem('experiments', JSON.stringify(experimentsData))
        } else {
          throw new Error('Invalid API response format')
        }
      } catch (error) {
        console.error('Error fetching experiments:', error)
        setError('Failed to load experiments. Please try again later.')

        // Try to load cached data as fallback
        try {
          const cachedData = window.localStorage.getItem('experiments')
          if (cachedData) {
            const sortedCachedData = JSON.parse(cachedData).sort((a: Experiment, b: Experiment) => a.id - b.id)
            setExperiments(sortedCachedData)
          }
        } catch (e) {
          console.error('Failed to load cached data:', e)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchExperiments()
  }, [])

  const handleExperimentClick = (experimentId: number) => {
    navigate(`/home/${experimentId}`)
  }

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'intermediate':
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'advanced':
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getUserName = () => {
    try {
      const userData = window.localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : 'Student'
    } catch {
      return 'Student'
    }
  }

  // Pagination logic
  const indexOfLastExperiment = currentPage * experimentsPerPage
  const indexOfFirstExperiment = indexOfLastExperiment - experimentsPerPage
  const currentExperiments = experiments.slice(indexOfFirstExperiment, indexOfLastExperiment)
  const totalPages = Math.ceil(experiments.length / experimentsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll to top of experiments section
    document.getElementById('experiments-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const getImageSrc = (experiment: Experiment) => {
    // If experiment has an image URL, use it
    if (experiment.image && experiment.image.startsWith('http')) {
      return experiment.image
    }

    // If it's a local path, construct it properly
    if (experiment.image) {
      return `./public/${experiment.image.replace('./', '')}`
    }

    // Fallback to default chemistry lab images based on ID
    const defaultImages = [
      './real_chemLab_bg.jpg',
      './real_chemLab_bg2.jpg',
      './real_chemLab_bg3.jpg'
    ]
    return defaultImages[experiment.id % defaultImages.length]
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SectionSidePanel isPanelOpen={isPanelOpen} togglePanel={togglePanel} />

      <div className={`flex-1 transition-all duration-300 ${isPanelOpen ? 'ml-64' : 'ml-16'} overflow-hidden`}>
        <div className="h-full overflow-y-auto">
          <div className={`${ds.components.container.content} max-w-7xl mx-auto`}>
            {/* Header Section */}
            <div className="mb-8 pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Typography className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {getUserName()}! 👋
                  </Typography>
                  <Typography className="text-lg text-gray-600">
                    Choose an experiment to begin practicing
                  </Typography>
                </div>
                <Button
                  onClick={() => navigate('/about')}
                  className={ds.components.button.ghost}
                >
                  📖 Need Help?
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-green-200">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography className="text-gray-600 text-lg font-medium">
                          Available Experiments
                        </Typography>
                        <Typography className="text-2xl font-bold text-gray-900">
                          {experiments.length}
                        </Typography>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🧪</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-green-200">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography className="text-gray-600 text-lg font-medium">
                          Current Page
                        </Typography>
                        <Typography className="text-2xl font-bold text-gray-900">
                          {currentPage} of {totalPages}
                        </Typography>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography className="text-purple-100 text-sm font-medium">
                          Learning Mode
                        </Typography>
                        <Typography className="text-2xl font-bold text-white">
                          Interactive
                        </Typography>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        🎯
                      </div>
                    </div>
                  </CardBody>
                </Card> */}
              </div>
            </div>

            {/* Experiments Section */}
            <div id="experiments-section">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <Typography className="text-gray-600 font-medium">
                      Loading experiments from laboratory database...
                    </Typography>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <Typography className="text-xl font-semibold text-gray-700 mb-2">
                      Unable to Load Experiments
                    </Typography>
                    <Typography className="text-gray-500 mb-4">
                      {error}
                    </Typography>
                    <Button
                      onClick={() => window.location.reload()}
                      className={ds.components.button.primary}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : experiments.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <Typography className="text-xl font-semibold text-gray-700 mb-2">
                    No experiments available
                  </Typography>
                  <Typography className="text-gray-500">
                    Check back later for new chemistry experiments.
                  </Typography>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Typography className="text-xl font-bold text-gray-900">
                      Experiments ({indexOfFirstExperiment + 1}-{Math.min(indexOfLastExperiment, experiments.length)} of {experiments.length})
                    </Typography>
                    {/* <Typography className="text-sm text-gray-500">
                      Sorted by ID • Click to start experiment
                    </Typography> */}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {currentExperiments.map((experiment) => (
                      <Card
                        key={experiment.id}
                        className={`${ds.components.card.base} ${ds.components.card.hover} ${ds.components.card.interactive} overflow-hidden`}
                        onClick={() => handleExperimentClick(experiment.id)}
                      >
                        {/* Experiment Image */}
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={getImageSrc(experiment)}
                            alt={experiment.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              // Fallback to default image if loading fails
                              e.currentTarget.src = './real_chemLab_bg.jpg'
                            }}
                          />
                          {/* <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-700">
                              ID: {experiment.id}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getDifficultyColor(experiment.level || 'Intermediate')}`}>
                              {experiment.level || 'Intermediate'}
                            </span>
                          </div> */}
                        </div>

                        <CardBody className="p-6">
                          <div className="mb-4">
                            <Typography className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {experiment.title}
                            </Typography>
                            <Typography className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                              {experiment.description}
                            </Typography>
                          </div>

                          <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {experiment.duration || '45-60 min'}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              {experiment.tools?.length || 0} Tools
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              {experiment.substances?.length || 0} Chemicals
                            </div>
                          </div>

                          <Button className={`w-full ${ds.components.button.primary}`}>
                            Start Experiment →
                          </Button>
                        </CardBody>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 pb-8">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 text-sm ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
                      >
                        ← Previous
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <Button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 text-sm ${
                            currentPage === pageNumber
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border'
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      ))}

                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 text-sm ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
                      >
                        Next →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
