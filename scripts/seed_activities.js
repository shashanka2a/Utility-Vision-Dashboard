import { Client } from 'pg';
import "dotenv/config";

const connectionString = process.env.SUPABASE_DB_CONNECTION_STRING;

if (!connectionString) {
  console.error("Please ensure SUPABASE_DB_CONNECTION_STRING is set in .env");
  process.exit(1);
}

const client = new Client({ connectionString });

const MOCK_ACTIVITIES = [
  {
    employeeName: 'William Barfield',
    action: 'submitted a material log in', 
    project: 'Caloosahatchee Wicking Project',
    activityType: 'Metrics', 
    timestamp: '8:19 PM | 2026-03-24 for 2026-03-23',
    metrics: [{ label: 'SPRAYING: Super Dye', value: '24', unit: 'oz.', highlight: true }],
    photos: [],
  },
  {
    employeeName: 'Ricky Smith',
    action: 'submitted a general note in', 
    project: 'Storey Bend Wicking Project',
    activityType: 'Notes', 
    timestamp: '5:32 AM | 2026-03-25 for 2026-03-24',
    metrics: [{ label: 'EQUIPMENT: Kubota', value: '4.5', unit: 'hrs', highlight: true }],
    photos: [
      'https://images.unsplash.com/photo-1637531347055-4fa8aa80c111?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1759579471231-4e68075ebc76?w=200&h=200&fit=crop',
    ],
  },
  {
    employeeName: 'Sarah Johnson',
    action: 'completed daily inspection for', 
    project: 'Redlands Wicking Project',
    activityType: 'Checklists', 
    timestamp: '8:15 AM | 2026-03-25 for 2026-03-25',
    metrics: [{ label: 'AREA COMPLETED', value: '15.2', unit: 'Acres', highlight: true, id: 'ACRES-003' }],
    photos: [],
  },
  {
    employeeName: 'Mike Torres',
    action: 'submitted equipment maintenance log in', 
    project: 'Oakwood Infrastructure',
    activityType: 'Checklists', 
    timestamp: '7:45 PM | 2026-03-24 for 2026-03-24',
    metrics: [{ label: 'MAINTENANCE: Filter Check', value: '1', unit: 'session', highlight: true }],
    photos: ['https://images.unsplash.com/photo-1759579471231-4e68075ebc76?w=200&h=200&fit=crop'],
  },
];

async function main() {
  await client.connect();
  console.log("Connected to the database. Running activities seed script...");

  try {
    // 1. Clear existing activities
    await client.query('DELETE FROM activities;');
    console.log("Cleared existing activities.");

    const insertQuery = `
      INSERT INTO activities (employee_name, action, project_name, activity_type, timestamp_label, metrics, photos)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `;

    for (const a of MOCK_ACTIVITIES) {
      const res = await client.query(insertQuery, [
        a.employeeName,
        a.action,
        a.project,
        a.activityType,
        a.timestamp,
        JSON.stringify(a.metrics),
        a.photos
      ]);
      console.log(`Inserted activity ${res.rows[0].id}`);
    }

  } catch (error) {
    console.error("Error seeding activities:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

main();
