/**
 * Run this script to create the safety_talk_templates table in Supabase.
 * Usage: node scripts/create_safety_talks_table.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('Creating safety_talk_templates table...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Safety talk templates table (stores PDF references)
      CREATE TABLE IF NOT EXISTS safety_talk_templates (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          TEXT NOT NULL,
        description   TEXT,
        pdf_url       TEXT,           -- Cloudinary or Supabase Storage URL
        pdf_public_id TEXT,           -- Cloudinary public_id for deletion
        file_size     BIGINT,         -- bytes
        uploaded_by   TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable Row Level Security
      ALTER TABLE safety_talk_templates ENABLE ROW LEVEL SECURITY;

      -- Allow all authenticated users to read
      CREATE POLICY IF NOT EXISTS "Allow read" ON safety_talk_templates
        FOR SELECT USING (true);

      -- Allow all authenticated users to insert
      CREATE POLICY IF NOT EXISTS "Allow insert" ON safety_talk_templates
        FOR INSERT WITH CHECK (true);

      -- Allow all authenticated users to update/delete
      CREATE POLICY IF NOT EXISTS "Allow update" ON safety_talk_templates
        FOR UPDATE USING (true);

      CREATE POLICY IF NOT EXISTS "Allow delete" ON safety_talk_templates
        FOR DELETE USING (true);
    `
  });

  if (error) {
    // If RPC not available, print the SQL to run manually
    console.error('RPC not available. Run this SQL in Supabase SQL editor:\n');
    console.log(`
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

ALTER TABLE safety_talk_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read"   ON safety_talk_templates FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON safety_talk_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON safety_talk_templates FOR UPDATE USING (true);
CREATE POLICY "Allow delete" ON safety_talk_templates FOR DELETE USING (true);
    `);
  } else {
    console.log('✅ safety_talk_templates table created successfully.');
  }
}

run();
