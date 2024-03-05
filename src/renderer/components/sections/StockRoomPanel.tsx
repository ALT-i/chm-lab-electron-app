import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWindowStore } from 'renderer/store'

import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Typography,
  Card,
  Tooltip,
} from '@material-tailwind/react'

import DraggableItem from './DraggableItem'

// The "App" comes from the context bridge in preload/index.ts
const { App } = window

function Icon({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${open ? 'rotate-180' : ''} h-5 w-5 transition-transform`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  )
}

function StockRoomPanel(props: any) {
  // const [instructorName, setInstructorName] = useState(null);
  const [openSubstance, setOpenSubstance] = React.useState(true)
  const [openApparatus, setOpenApparatus] = React.useState(true)

  const handleOpenSubstance = () => setOpenSubstance((cur) => !cur)
  const handleOpenApparatus = () => setOpenApparatus((cur) => !cur)

  const substances = props.substances
  const apparatus = props.tools

  return (
    <div className="w-1/4 px-2 py-3 mx-2 my-7 overflow-auto bg-gray-300 rounded-lg shadow-inner">
      <Typography
        variant="h4"
        color="green"
        className="w-52 rounded-sm shadow-sm"
      >
        Stockroom
      </Typography>
      <Accordion
        open={openSubstance}
        icon={<Icon open={openSubstance} />}
        className="mb-2 rounded-lg border border-blue-gray-100 px-4"
      >
        <AccordionHeader
          onClick={handleOpenSubstance}
          className={`border-b-2 bg-gray-200 w-52 px-2 py-0 my-3 rounded-md shadow-xl transition-colors ${
            openSubstance ? ' text-green-500 hover:!text-green-700' : ''
          }`}
        >
          <p>Substances</p>
        </AccordionHeader>
        <AccordionBody className="pt-0 px-2 text-base font-normal">
          <ul className="substance-list grid grid-cols-3 gap-1">
            {substances &&
              substances.map((subs, index) => (
                // <li>{subs}</li>
                <li
                  key={index}
                  className="max-w-20  border-dotted hover:border-solid border cursor-grab"
                >
                  <DraggableItem item={subs} type="SUBSTANCE" />
                </li>
              ))}
          </ul>
        </AccordionBody>
      </Accordion>
      <Accordion
        open={openApparatus}
        icon={<Icon open={openApparatus} />}
        className="mb-2 rounded-lg border border-blue-gray-100 px-4"
      >
        <AccordionHeader
          onClick={handleOpenApparatus}
          className={`border-b-0 w-52 bg-gray-200 px-2 py-0 my-3 rounded-md shadow-xl transition-colors ${
            openApparatus ? 'text-green-500 hover:!text-green-700' : ''
          }`}
        >
          <p>Apparatus</p>
          <i className="fa fa-cubes" aria-hidden="true"></i>
        </AccordionHeader>
        <AccordionBody className="pt-0 text-base font-normal">
          <ul className="apparatus-list grid grid-cols-3 gap-1">
            {apparatus &&
              apparatus.map((tool, index) => (
                // <li>{tool}</li>
                <li
                  key={index}
                  className="max-w-40 border-dotted hover:border-solid border cursor-grab"
                >
                  <Tooltip content={tool.name}>
                    <DraggableItem item={tool} type="TOOL" />
                  </Tooltip>
                </li>
              ))}
          </ul>
        </AccordionBody>
      </Accordion>
    </div>
  )
}

export default StockRoomPanel
