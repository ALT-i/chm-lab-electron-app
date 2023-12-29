import { Container, Heading } from 'renderer/components'

import styles from './styles.module.sass'
import SectionMainHeader from 'renderer/components/sections/SectionMainHeader'

export function AboutScreen() {
  return (
    // className={styles.subtitle}
    <Container>
      <div className={styles.authentication}>
            <SectionMainHeader />
            <div>
                <h3>
                    Powered by ALT-I
                </h3>
            </div>
        </div>
    </Container>
  )
}
