import { Router } from 'express'
import { getHealth } from '../controllers/healthController.js'
import authRoutes from './authRoutes.js'
import profileRoutes from './profileRoutes.js'
import trackerRoutes from './trackerRoutes.js'
import pregnancyRoutes from './pregnancyRoutes.js'
import medicineRoutes from './medicineRoutes.js'
import pcosAssessmentRoutes from "./pcosAssessmentRoutes.js";
import journalRoutes from './journalRoutes.js'
import savedQuoteRoutes from './savedQuoteRoutes.js'
import schemeRoutes from './schemeRoutes.js'

const router = Router()
router.get('/', getHealth)
router.use('/', authRoutes)
router.use('/', profileRoutes)
router.use('/', trackerRoutes)
router.use('/api/pregnancy', pregnancyRoutes)
router.use('/api/medicine-reminders', medicineRoutes)
router.use("/pcos-assessments", pcosAssessmentRoutes);
router.use('/api/journals', journalRoutes);
router.use('/api/saved-quotes', savedQuoteRoutes)
router.use('/api/schemes', schemeRoutes)
export default router
