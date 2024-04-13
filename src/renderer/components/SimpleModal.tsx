// SimpleModal.js
import React from 'react'

const SimpleModal = ({ isOpen, onClose, title, nextStep, warning = '' }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg max-w-sm w-full mx-2">
        <div className="bg-gray-200 p-3 rounded-t-lg">
          <h2
            className={`text-lg font-bold ${
              warning === '' ? 'text-green-500' : 'text-red-600'
            }`}
          >
            {title}
          </h2>
        </div>
        <div className="p-3 text-red-600">{warning}</div>
        <div>{nextStep}</div>
        <button
          onClick={onClose}
          className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Ok
        </button>
      </div>
    </div>
  )
}

export default SimpleModal
