import React, { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Drawer,
  Button,
  Typography,
  IconButton,
} from '@material-tailwind/react'

import server from '../utils'
import ProgressChartDisplay from './sections/ProgressChartDisplay'
import TokenizeFormula from './Formula'

// Inside the Modal component

const Modal = ({ item, onClose, type }) => (
  <div className="fixed w-72 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-2xl transition-all duration-500">
    <img className="w-32 h-32 mx-auto" src={item.image} alt={item.name} />
    <h2 className="text-center text-xl font-bold">{item.name}</h2>
    <p className="text-center text-pretty text-sm truncate">
      {type === 'substance' && item?.formula && (
        <TokenizeFormula formula={item.formula} />
      )}{' '}
    </p>
    {type === 'apparatus' && (
      <div className="py-5">
        {item.category && <p>Type: {item.category}</p>}
        {item.material && <p>Material: {item.material}</p>}
        {item.volume && <p>Volume(cm3): {item.volume}</p>}
        {item.thermal_properties && (
          <p>Thermal Properties: {item.thermal_properties}</p>
        )}
        {/* Add more apparatus-specific parameters */}
      </div>
    )}
    {type === 'substance' && (
      <div className="py-5">
        {item.volume && <p>Volume(cm3): {item.volume}</p>}
        {item.phValue && <p>PH Value: {item.phValue}</p>}
        {item.molarity && <p>Molarity: {item.molarity}</p>}
        {item.thermal_properties && (
          <p>Thermal Properties: {item.thermal_properties}</p>
        )}
        {/* Add more substance-specific parameters */}
      </div>
    )}
    <button
      className="bg-green-500 text-white px-4 py-2 mt-4 rounded-md"
      onClick={onClose}
    >
      Close
    </button>
  </div>
)

function ShelfPage(props: any) {
  const navigate = useNavigate()
  const { type } = useParams()
  const [chosenShelf, setChosenShelf] = useState(null)
  const [shelfItems, setShelfItems] = useState(null)

  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleItemClick = (item) => {
    setSelectedItem(item)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  const toggleTooltip = () => {
    setIsTooltipOpen(!isTooltipOpen)
  }

  const goBack = () => {
    navigate(-1) // Go back to the previous page
  }

  const isPanelOpen = props.isPanelOpen

  const title =
    type === 'apparatus'
      ? 'Apparatus'
      : type === 'substance'
      ? 'Substance list'
      : ''

  const getWorkbench = (type) => {
    // if (type) {
    setChosenShelf(type)

    axios
      .get(`${server.absolute_url}/${server.workbench}/${type}/`, {
        headers: {
          'Content-Type': 'application/json',
          // "authorization": token
        },
      })
      .then((res) => {
        setShelfItems(res.data.results)

        console.log(shelfItems)
      })
      .catch((err) => {
        if (err.message === 'Network Error') {
          console.log(err)
        }
      })
    // }
  }

  useEffect(() => {
    if (type) {
      getWorkbench(type)
    } else {
      getWorkbench('apparatus')
    }
  }, [type])

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
        {chosenShelf ? (
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
                  <Typography variant="h2" color="green" className="ml-5">
                    {title}
                  </Typography>
                </div>
              </div>
              <div className="mx-16 my-10">
                <div className="grid grid-cols-6 gap-4 justify-center">
                  {Array.isArray(shelfItems) &&
                    shelfItems.map((item, index) => (
                      <div
                        key={index}
                        className="col-span-1 text-center border-solid border cursor-pointer  hover:bg-green-100"
                        onClick={() => handleItemClick(item)}
                      >
                        <img
                          className="w-32 h-32 py-3"
                          style={{ display: 'block', margin: '0 auto' }}
                          src={item.image}
                          alt={item.name}
                        />
                        <p className="text-pretty text-sm truncate">
                          {item.name}
                          {type === 'substance' && item?.formula && (
                            <TokenizeFormula formula={item.formula} />
                          )}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ProgressChartDisplay />
        )}
      </div>
      {selectedItem && (
        <Modal item={selectedItem} onClose={handleCloseModal} type={type} />
      )}
    </div>
  )
}

export default ShelfPage
