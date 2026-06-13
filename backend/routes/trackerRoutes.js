import { Router } from 'express'
import { createPeriodLog, getPeriodLogsByUserId, getDebugPeriodLogsByUserId, updatePeriodLog, deletePeriodLog } from '../controllers/trackerController.js'

const router = Router()

router.post('/period-log', createPeriodLog)
router.get('/period-logs/:userId', getPeriodLogsByUserId)
router.get('/period-logs-debug/:userId', getDebugPeriodLogsByUserId)
router.put('/period-log/:id', updatePeriodLog)
router.delete('/period-log/:id', deletePeriodLog)

export default router
