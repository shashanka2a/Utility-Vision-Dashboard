/**
 * Creates the safety_talk_templates table directly via PostgreSQL connection.
 * Usage: node scripts/create_safety_talks_table.js
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('Connected to database. Creating safety_talk_templates table...');

  await client.query(`
    CREATE TABLE IF NOT EXISTS safety_talk_templates (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT NOT NULL,
      description   TEXT,
      pdf_url       TEXT,
      pdf_public_id TEXT,
      file_size     BIGINT,
      uploaded_by   TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Table created (or already exists).');

  await client.query(`ALTER TABLE safety_talk_templates ENABLE ROW LEVEL SECURITY;`);
  console.log('✅ RLS enabled.');

  // Drop existing policies if re-running
  for (const policy of ['Allow read', 'Allow insert', 'Allow update', 'Allow delete']) {
    await client.query(
      `DROP POLICY IF EXISTS "${policy}" ON safety_talk_templates;`
    );
  }

  await client.query(`
    CREATE POLICY "Allow read"   ON safety_talk_templates FOR SELECT USING (true);
    CREATE POLICY "Allow insert" ON safety_talk_templates FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow update" ON safety_talk_templates FOR UPDATE USING (true);
    CREATE POLICY "Allow delete" ON safety_talk_templates FOR DELETE USING (true);
  `);
  console.log('✅ RLS policies applied.');

  // Verify
  const { rows } = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'safety_talk_templates'
    ORDER BY ordinal_position;
  `);
  console.log('\n📋 Table schema:');
  rows.forEach(r => console.log(`   ${r.column_name.padEnd(20)} ${r.data_type}`));

  await client.end();
  console.log('\n🎉 Done! safety_talk_templates is ready.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
