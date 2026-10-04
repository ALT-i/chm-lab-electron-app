import React, { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Typography, IconButton, Button } from '@material-tailwind/react'

import server from '../utils'
import { getAuthHeader } from '../utils/index'
import SectionSidePanel from './sections/SectionSidePanel'
import ProgressChartDisplay from './sections/ProgressChartDisplay'
import AnimationBox from './sections/AnimationBox'
import StockRoomPanel from './sections/StockRoomPanel'
import InstructionsPanel from './sections/InstructionsPanel'

function IndexPage(props: any) {
  const navigate = useNavigate()
  const { class_id } = useParams()
  const [chosenClass, setChosenClass] = useState(null)
  const [substances, setSubstances] = useState(null)
  const [tools, setTools] = useState(null)
  const [classTitle, setClassTitle] = useState(null)
  const [classInstruction, setClassInstruction] = useState(null)
  const [classInstructor, setClassInstructor] = useState(null)
  const [classParameters, setClassParameters] = useState(null)
  const [classProcedure, setClassProcedure] = useState(null)
  const [classVideo, setClassVideo] = useState(null)
  const [moodleAssignmentId, setMoodleAssignmentId] = useState<number | null>(null)
  const [isExperimentCompleted, setIsExperimentCompleted] = useState(false)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [drawerState, setOpenDrawer] = React.useState(false)
  const [drawerVisible, setDrawerVisible] = useState(true)

  const togglePanel = () => {
    setDrawerVisible(!drawerVisible)
  }

  const openDrawer = () => setOpenDrawer(true)
  const closeDrawer = () => setOpenDrawer(false)

  const toggleTooltip = () => {
    setIsTooltipOpen(!isTooltipOpen)
  }

  const goBack = () => {
    navigate(-1) // Go back to the previous page
  }

  const submitToMoodle = async () => {
    try {
      const email = window.localStorage.getItem('user_email')
      if (!email) {
        alert('Missing user email. Please log in again.')
        return
      }

      // Check if experiment is completed
      if (!isExperimentCompleted) {
        alert('⚠️ Please complete all experiment steps before submitting to Moodle.')
        return
      }

      // Check if assignment ID is configured
      if (!moodleAssignmentId) {
        alert('This experiment is not linked to a Moodle assignment yet. Please contact your instructor.')
        return
      }

      const headers = { 'Content-Type': 'application/json', ...getAuthHeader() }
      const response = await axios.post(
        `${server.absolute_url}/${server.moodle_assignment_grades}`,
        {
          course_id: 9,
          assignment_id: moodleAssignmentId,
          grades: [{ email, grade: 100, feedback: `Completed experiment: ${classTitle || 'Lab'}` }],
        },
        { headers }
      )

      // Check results for errors
      const results = response.data.results || []
      const failed = results.filter((r: any) => r.status === 'error')

      if (failed.length > 0) {
        const errorDetail = failed[0].detail || 'Unknown error'
        if (errorDetail.includes('not found') || errorDetail.includes('not enrolled')) {
          alert('⚠️ You are not enrolled in the CHM 191 course on Moodle. Please contact your instructor to be added to the course.')
        } else {
          alert(`Failed to submit: ${errorDetail}`)
        }
      } else {
        alert('✅ Successfully submitted to Moodle!')
      }
    } catch (e: any) {
      console.error(e)
      const errorMsg = e?.response?.data?.detail || e?.message || 'Failed to submit to Moodle. Please try again.'
      alert(errorMsg)
    }
  }

  const isPanelOpen = props.isPanelOpen

  //Fetch class details from local machine with node process and render with IPC signals

  function getSubstance(substances: any) {
    const substanceNames: any = []
    for (const sub of substances) {
      axios
        .get(`${server.absolute_url}/${server.workbench}/apparatus/${sub}/`, {
          headers: {
            'Content-Type': 'application/json',
            // "authorization": token
          },
        })
        .then((res) => {
          console.log(res.data.data)
          substanceNames.push[res.data.data.name]
        })
        .catch((err) => {
          if (err.message === 'Network Error') {
            console.log(err)
          }
        })
    }
    console.log(substanceNames)
  }

  const getWorkbench = () => {
    if (class_id) {
      setChosenClass(class_id)

      axios
        .get(`${server.absolute_url}/${server.workspace}/${class_id}/`, {
          headers: {
            'Content-Type': 'application/json',
            // "authorization": token
          },
        })
        .then((res) => {
          //Save following class details to local machine with IPC signals

          // setSubstances(res.data.substances);
          // setApparatus(res.data.apparatus);
          // getSubstance(res.data.substances);
          setTools(res.data.data.tools)
          setSubstances(res.data.data.substances)
          setClassInstruction(res.data.data.instructions)
          // setClassInstructor(res.data.data.instructor)
          setClassProcedure(res.data.data.procedure)
          setClassParameters(res.data.data.parameters)
          setClassTitle(res.data.data.title)
          setClassVideo(res.data.data.video_file)
          // Safely handle moodle_assignment_id even if field doesn't exist yet
          setMoodleAssignmentId(res.data.data.moodle_assignment_id || 1) // Default to 1 for now
        })
        .catch((err) => {
          console.error('Error fetching workbench:', err)
          // Handle specific error cases
          if (err.response?.status === 401) {
            navigate('/login')
          }
          // Show user-friendly error message
        })
    }
  }

  useEffect(() => {
    getWorkbench()
    // document.addEventListener("mousemove", function(e){
    //     const ele = document.getElementById('workspaceLesson');
    //     const distance = ele.offsetLeft + ele.offsetWidth - e.pageX;
    //     distance < 9 && distance > -0.1 ? ele.classList.add('more-width') : ele.classList.remove('more-width');
    // });
  }, [])

  console.log(classVideo)
  return (
    <div className="index-page">
      <div
        className={`main-content index-page-main transition-all duration-300 ease-in-out ${
          isPanelOpen ? 'ml-52' : 'ml-16'
        }`}
      >
        <div className="flex bg-green-900 py-5 px-2 shadow-lg rounded-lg">
          <div className="row px-1">
            <img
              className="h-7 w-8 rounded-full"
              src="./noun_logo.png"
              alt=""
            />
            <img
              className="h-7 w-8 rounded-full"
              src="./acetel_logo.png"
              alt=""
            />
          </div>
          <Typography variant="h6" color="white">
            National Open University of Nigeria (NOUN)
            <p />
            Africa Centre of Excellence on Technology Enhanced Learning (ACETEL)
          </Typography>
        </div>
        {chosenClass ? (
          <div id="workspaceLesson" className="workspace-lesson">
            <div className="lesson-section">
              <div className="lesson-title">
                <div className="flex">
                  <button
                    className="bg-white hover:bg-gray-100 text-gray-800 float-right font-semibold py-2 px-5 my-1 mx-1 border border-gray-400 rounded shadow"
                    onClick={goBack}
                  >
                    &#10094;
                  </button>
                  <div className="ml-5 px-2">
                    <Typography variant="h3" color="green" textGradient>
                      {classTitle}
                    </Typography>
                    <Typography
                      variant="paragraph"
                      color="blue-gray"
                      textGradient
                    >
                      {/* Instructor: {classInstructor} */}
                    </Typography>
                  </div>
                  <div className="flex gap-2 ml-auto items-center">
                    {!isExperimentCompleted && (
                      <span className="text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        ⚠️ Complete all steps to submit
                      </span>
                    )}
                    {isExperimentCompleted && (
                      <span className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        ✅ Experiment Complete
                      </span>
                    )}
                    <button
                      className={`text-lg font-semibold px-4 py-2 my-1 rounded-lg border shadow-lg transition-all ${
                        isExperimentCompleted
                          ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                      }`}
                      onClick={submitToMoodle}
                      disabled={!isExperimentCompleted}
                      title={
                        isExperimentCompleted
                          ? 'Submit completion to Moodle'
                          : 'Complete all experiment steps first'
                      }
                    >
                      📤 Submit to Moodle
                    </button>
                    {!drawerVisible && (
                      <button
                        className="text-lg bg-green-500 hover:bg-white font-normal px-4 my-1 rounded-lg border shadow-lg"
                        onClick={() => setDrawerVisible(!drawerVisible)}
                        title="Toggle Sidebar"
                      >
                        Instructions
                      </button>
                    )}
                  </div>
                </div>
                {/* <h3 className="float-right">Instructor: {classInstructor}</h3> */}
                {/* <p>Parameters: {classParameters}</p> */}
              </div>
              <div
                className="flex flex-row"
                style={{
                  height: drawerVisible ? '80vh' : '75vh',
                }}
              >
                <StockRoomPanel
                  substances={substances}
                  tools={tools}
                  // classInstructor={classInstructor}
                />
                <AnimationBox
                  procedure={classProcedure}
                  panel={drawerVisible}
                  substances={substances}
                  onExperimentComplete={setIsExperimentCompleted}
                />

                <InstructionsPanel
                  isOpen={drawerVisible}
                  closeDrawer={togglePanel}
                  classTitle={classTitle}
                  // classInstructor={classInstructor}
                  classVideo={classVideo}
                  classInstruction={classInstruction}
                />
              </div>
            </div>
          </div>
        ) : (
          <ProgressChartDisplay />
        )}
      </div>
    </div>
  )
}

export default IndexPage
