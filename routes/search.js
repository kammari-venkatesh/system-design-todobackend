import express from 'express';
import StudyPlan from '../models/StudyPlan.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) return res.json({ results: [] });

    const plan = await StudyPlan.findOne({ version: 1 }).lean();
    if (!plan) return res.json({ results: [] });

    const results = [];
    let dayNum = 0;

    plan.weeks.forEach((week) => {
      week.days.forEach((day) => {
        dayNum += 1;
        const haystack = [
          day.topic,
          day.lbl,
          week.title,
          week.note || '',
          ...day.tasks,
          `week ${week.w}`,
          `phase ${week.phase}`,
          `day ${dayNum}`,
        ]
          .join(' ')
          .toLowerCase();

        if (haystack.includes(q)) {
          results.push({
            dayNum,
            week: week.w,
            phase: week.phase,
            topic: day.topic,
            weekTitle: week.title,
            tasks: day.tasks,
            practice: day.practice,
          });
        }
      });
    });

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Search failed' });
  }
});

export default router;
