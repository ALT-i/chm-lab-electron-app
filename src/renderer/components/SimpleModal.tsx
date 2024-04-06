// SimpleModal.js
import React from 'react'

const SimpleModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg max-w-sm w-full mx-2">
        {children}
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ok
        </button>
      </div>
    </div>
  )
}

export default SimpleModal
