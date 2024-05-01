import React from 'react'

import SectionMainHeader from './sections/SectionMainHeader'
import { Typography } from '@material-tailwind/react'

function IndexHeader() {
  return (
    <div className="authentication float-child side-banner flex w-full flex-col md:justify-between">
      <div></div>
      <SectionMainHeader />
      {/* <div>
        <h3>Powered by ALT-I</h3>
      </div> */}
      <footer className="flex w-full flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 border-t border-blue-gray-50 text-center md:justify-between">
        {/* <Typography
          color="lime"
          className="font-normal flex w-full justify-center items-center text-sm"
          placeholder={''}
          variant="h6"
        >
          Developed by ALT-I
        </Typography> */}
      </footer>
    </div>
  )
}

export default IndexHeader
