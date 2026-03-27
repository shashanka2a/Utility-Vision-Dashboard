const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected to the database. Checking table counts...");

  const tables = ['notes', 'activities', 'projects', 'metrics', 'equipment_logs', 'chemicals_logs', 'incidents', 'observations', 'safety_talks'];

  try {
    for (const table of tables) {
      const res = await client.query(`SELECT count(*) FROM public.${table}`);
      console.log(`Table: ${table}, Count: ${res.rows[0].count}`);
    }

    const activities = await client.query(`SELECT activity_type, count(*) FROM public.activities GROUP BY activity_type`);
    console.log("\nActivities broken down by type:");
    console.table(activities.rows);

  } catch (error) {
    console.error("Error checking counts:", error.message);
  } finally {
    await client.end();
  }
}

main();
