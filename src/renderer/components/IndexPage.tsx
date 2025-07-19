import React, { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Typography, IconButton, Button } from '@material-tailwind/react'

import server from '../utils'
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
                  {!drawerVisible && (
                    <p>
                      <button
                        className="text-lg bg-green-500 hover:bg-white  font-normal px-4 my-1 rounded-lg border shadow-lg"
                        onClick={() => setDrawerVisible(!drawerVisible)}
                        title="Toggle Sidebar"
                      >
                        Instructions
                      </button>
                    </p>
                  )}
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
