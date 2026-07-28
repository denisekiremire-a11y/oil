import { Router } from 'express'
import { CAPM_CLASS_NAME, CAPM_CLASS_START, PROGRAM_END, PROGRAM_START } from '../config.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    programStart: PROGRAM_START,
    programEnd: PROGRAM_END,
    capmClassName: CAPM_CLASS_NAME,
    capmClassStart: CAPM_CLASS_START,
  })
})

export default router
