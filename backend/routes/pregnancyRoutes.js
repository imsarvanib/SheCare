import { Router } from 'express'
import {
  addPregnancyAppointment,
  deletePregnancyAppointment,
  getPregnancyProfile,
  resetPregnancyTracking,
  updatePregnancyAppointment,
  upsertLmpDate,
} from '../controllers/pregnancyController.js'

const router = Router()

router.get('/:userId', getPregnancyProfile)
router.post('/lmp', upsertLmpDate)
router.post('/appointment', addPregnancyAppointment)
router.put('/appointment/:appointmentId', updatePregnancyAppointment)
router.delete('/appointment/:appointmentId', deletePregnancyAppointment)
router.delete('/reset/:userId', resetPregnancyTracking)

export default router