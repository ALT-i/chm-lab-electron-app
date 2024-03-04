import React, { useRef } from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import server from '../utils'
import SectionSidePanel from './sections/SectionSidePanel'
import ProgressChartDisplay from './sections/ProgressChartDisplay'
import AnimationBox from './sections/AnimationBox'

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

  const toggleTooltip = () => {
    setIsTooltipOpen(!isTooltipOpen)
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
      console.log(class_id)

      axios
        .get(`${server.absolute_url}/${server.workspace}/${class_id}/`, {
          headers: {
            'Content-Type': 'application/json',
            // "authorization": token
          },
        })
        .then((res) => {
          console.log(res)
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

  return (
    <div className="index-page">
      <div
        className={`main-content index-page-main transition-all duration-300 ease-in-out ${
          isPanelOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {chosenClass ? (
          <div id="workspaceLesson" className="workspace-lesson">
            <div className="lesson-section">
              <div className="lesson-title">
                <h3>{classTitle}</h3>
                <button
                  className="hamburger-menu p-2 absolute top-3 right-3 z-50 text-2xl bg-green-100 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow"
                  onClick={toggleTooltip}
                  title="Toggle Sidebar"
                >
                  &#128712; {/* Hamburger icon */}
                </button>
                {/* <h3 className='float-right'>Instructor: {classInstructor}</h3> */}
                {/* <p>Parameters: {classParameters}</p> */}
              </div>
              <div
                className={`panel ${
                  isTooltipOpen ? 'block' : 'hidden'
                } bg-gray-200 z-30 w-96 h-screen fixed top-0 right-0 transition-all duration-300 ease-in-out transform
                py-16 overflow-auto ${
                  isTooltipOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                <div className="container">
                  <video width="320" height="240" controls>
                    <source src={classVideo} type="video/mp4" />
                    Error fetching demo video.
                  </video>
                </div>
                <div className="lesson-instruction">
                  <p className="title">Instructions</p>
                  <p dangerouslySetInnerHTML={{ __html: classInstruction }}></p>
                </div>
              </div>
              <AnimationBox />
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
