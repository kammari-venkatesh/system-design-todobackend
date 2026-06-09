import express from 'express';
import StudyPlan from '../models/StudyPlan.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const plan = await StudyPlan.findOne({ version: 1 }).lean();
    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found. Run npm run seed first.' });
    }
    res.json({ phases: plan.phases, weeks: plan.weeks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch study plan' });
  }
});

export default router;
