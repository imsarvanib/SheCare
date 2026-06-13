import { Router } from 'express'
import {
  createMedicineReminder,
  deleteMedicineReminder,
  getMedicineReminders,
  toggleMedicineReminder,
  updateMedicineReminder,
} from '../controllers/medicineController.js'

const router = Router()

router.get('/:userId', getMedicineReminders)
router.post('/', createMedicineReminder)
router.put('/:id', updateMedicineReminder)
router.patch('/:id/toggle', toggleMedicineReminder)
router.delete('/:id', deleteMedicineReminder)

export default router