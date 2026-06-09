import User from '../models/User.js';

export async function syncUserIndexes() {
  const collection = User.collection;
  const indexes = await collection.indexes();

  for (const index of indexes) {
    const keys = Object.keys(index.key || {});
    if (keys.includes('email') || keys.includes('passwordHash')) {
      await collection.dropIndex(index.name);
      console.log(`Dropped old index: ${index.name}`);
    }
  }

  await User.syncIndexes();
}
