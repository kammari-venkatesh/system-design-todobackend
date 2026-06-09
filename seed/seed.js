import '../config/env.js';
import { connectDB } from '../config/db.js';
import StudyPlan from '../models/StudyPlan.js';
import { PLAN, PHASES } from './planData.js';

async function seed() {
  await connectDB();

  const existing = await StudyPlan.findOne({ version: 1 });
  if (existing) {
    console.log('Study plan already seeded — skipping');
    process.exit(0);
  }

  await StudyPlan.create({
    version: 1,
    phases: PHASES,
    weeks: PLAN,
  });

  console.log('Study plan seeded successfully');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
