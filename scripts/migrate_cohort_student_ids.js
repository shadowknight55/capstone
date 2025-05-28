l// Usage: node scripts/migrate_cohort_student_ids.js
// This script will convert all string student IDs in the cohorts collection to ObjectIds.

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'school_portal';

async function migrate() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const cohorts = db.collection('cohorts');

    const allCohorts = await cohorts.find({}).toArray();
    let updatedCount = 0;

    for (const cohort of allCohorts) {
      if (!Array.isArray(cohort.students)) continue;
      let needsUpdate = false;
      const newStudents = cohort.students.map(id => {
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          needsUpdate = true;
          return new ObjectId(id);
        }
        return id;
      });
      if (needsUpdate) {
        await cohorts.updateOne(
          { _id: cohort._id },
          { $set: { students: newStudents } }
        );
        updatedCount++;
        console.log(`Updated cohort ${cohort._id}`);
      }
    }
    console.log(`Migration complete. Updated ${updatedCount} cohort(s).`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.close();
  }
}

migrate(); 