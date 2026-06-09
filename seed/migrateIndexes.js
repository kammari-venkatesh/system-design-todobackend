import '../config/env.js';
import { connectDB } from '../config/db.js';
import { syncUserIndexes } from '../config/syncIndexes.js';

async function migrateIndexes() {
  await connectDB();
  await syncUserIndexes();
  console.log('User indexes synced');
  process.exit(0);
}

migrateIndexes().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
