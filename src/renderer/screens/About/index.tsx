import { Container, Heading } from 'renderer/components'

import styles from './styles.module.sass'
import SectionMainHeader from 'renderer/components/sections/SectionMainHeader'
import { Typography } from '@material-tailwind/react'

export function AboutScreen() {
  return (
    // className={styles.subtitle}
    <Container>
      <div className={styles.authentication}>
        <SectionMainHeader />

        {/* <div>
                <h3>
                    Powered by ALT-I
                </h3>
            </div> */}
        <footer className="flex w-full flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 border-t border-blue-gray-50 py-6 text-center md:justify-between">
          <Typography color="blue-gray" className="font-normal">
            Developed by ALT-I
          </Typography>
        </footer>
      </div>
    </Container>
  )
}
