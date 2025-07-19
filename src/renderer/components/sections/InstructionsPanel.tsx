import React from 'react'
import {
  Drawer,
  Button,
  Typography,
  IconButton,
} from '@material-tailwind/react'
import VideoPlayer from '../VideoPlayer'

function InstructionsPanel(props: any) {
  const [drawerState, setOpenDrawer] = React.useState(false)

  // React.useEffect(() => {
  //   props.onToggle(drawerState) // Assuming `onToggle` is a prop function passed from parent
  // }, [drawerState])

  const {
    classTitle,
    classInstructor,
    classVideo,
    classInstruction,
    closeDrawer,
    isOpen,
  } = props

  const drawerClasses = `instructions-drawer ${isOpen ? 'open' : ''}`

  return (
    <div
      className={`w-1/5 basis-1/5 bg-gray-300 shadow-lg rounded-lg px-2 py-4 mx-2 my-7 overflow-auto ${drawerClasses}`}
    >
      <div className="flex justify-between items-center w-full px-3 py-1 rounded-lg shadow-sm">
        <Typography variant="h5" color="green" textGradient>
          Instructions
        </Typography>
        {/* <IconButton variant="text" color="blue-gray" onClick={closeDrawer}>
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
        </IconButton> */}
        {/* <Typography variant="h5" color="green" textGradient>
        {classTitle}
      </Typography>
      <Typography variant="paragraph" color="blue-gray">
        Instructor: {classInstructor}
      </Typography> */}
      </div>
      <div className="lesson-instruction">
        <VideoPlayer
          src={classVideo}
          className="h-full w-full mb-5"
          controls={true}
          autoPlay={false}
          muted={true}
          onError={(error) => console.error('Video error:', error)}
        />
        <div
          className="!list-decimal"
          dangerouslySetInnerHTML={{ __html: classInstruction }}
        ></div>
      </div>
    </div>
  )
}

export default InstructionsPanel
