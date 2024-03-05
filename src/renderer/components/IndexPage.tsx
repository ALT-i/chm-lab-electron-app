import React, { useRef } from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Drawer,
  Button,
  Typography,
  IconButton,
} from '@material-tailwind/react'

import server from '../utils'
import SectionSidePanel from './sections/SectionSidePanel'
import ProgressChartDisplay from './sections/ProgressChartDisplay'
import AnimationBox from './sections/AnimationBox'
import StockRoomPanel from './sections/StockRoomPanel'

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
  const [classVideo, setClassVideo] = useState(null)
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [drawerState, setOpenDrawer] = React.useState(false)

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
          console.log(res.data)
          substanceNames.push[res.data.name]
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
          setTools(res.data.tools)
          setSubstances(res.data.substances)
          setClassInstruction(res.data.instructions)
          setClassInstructor(res.data.instructor)
          setClassParameters(res.data.parameters)
          setClassTitle(res.data.title)
          setClassVideo(res.data.video_file)
        })
        .catch((err) => {
          if (err.message === 'Network Error') {
            console.log(err)
          }
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
        {chosenClass ? (
          <div id="workspaceLesson" className="workspace-lesson">
            <div className="lesson-section">
              <div className="lesson-title flex">
                <button
                  className="bg-white hover:bg-gray-100 text-gray-800 float-right font-semibold py-2 px-5 my-1 mx-1 border border-gray-400 rounded shadow"
                  onClick={goBack}
                >
                  &#10094;
                </button>
                <h3>{classTitle}</h3>
                <button
                  className="text-2xl text-gray-800 font-semibold px-4 rounded-full shadow-inner"
                  onClick={openDrawer}
                  title="Toggle Sidebar"
                >
                  &#128712; {/* Hamburger icon */}
                </button>
                {/* <h3 className='float-right'>Instructor: {classInstructor}</h3> */}
                {/* <p>Parameters: {classParameters}</p> */}
              </div>
              <Drawer
                size={500}
                placement="right"
                open={drawerState}
                onClose={closeDrawer}
                className="p-4"
              >
                {/* <div //intrsuction panel
                  className={`panel ${
                    isTooltipOpen ? 'block' : 'hidden'
                  } bg-gray-200 z-30 w-96 h-screen fixed top-0 right-0 transition-all duration-300 ease-in-out transform
                py-16 overflow-auto ${
                  isTooltipOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                > */}
                <div className=" h-full overflow-auto">
                  <div className="mb-6 flex items-center justify-between">
                    <Typography variant="h5" color="blue-gray">
                      Instructions
                    </Typography>
                    <IconButton
                      variant="text"
                      color="blue-gray"
                      onClick={closeDrawer}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </IconButton>
                  </div>
                  <div className="lesson-instruction">
                    <video
                      className="h-full w-full mb-5 rounded-lg"
                      controls
                      autoPlay
                      muted
                      key={classVideo}
                    >
                      <source src={classVideo} type="video/mp4" />
                      Error fetching demo video.
                    </video>
                    <p
                      dangerouslySetInnerHTML={{ __html: classInstruction }}
                    ></p>
                  </div>
                </div>
                {/* </div> */}
              </Drawer>
              <div className="flex">
                <StockRoomPanel
                  substances={substances}
                  tools={tools}
                  classInstructor={classInstructor}
                />
                <AnimationBox />
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
