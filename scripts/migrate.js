#!/usr/bin/env node
/**
 * migrate.js — run all DB migrations against Supabase
 * Usage: node scripts/migrate.js
 */

require('dotenv').config();
const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_CONNECTION_STRING;
if (!connectionString) {
  console.error('❌  SUPABASE_DB_CONNECTION_STRING is missing from .env');
  process.exit(1);
}

// ─── All migrations in order ──────────────────────────────────────────────────
const migrations = [
  {
    name: '001_create_projects',
    sql: `
      CREATE TABLE IF NOT EXISTS public.projects (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name             TEXT NOT NULL,
        job_number       TEXT NOT NULL,
        acres_completed  NUMERIC(8,1) NOT NULL DEFAULT 0,
        status           TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'paused', 'completed')),
        last_activity    TEXT,
        street_address   TEXT,
        city             TEXT,
        state            TEXT,
        zip_code         TEXT,
        country          TEXT DEFAULT 'United States',
        start_date       DATE,
        end_date         DATE,
        project_groups   TEXT,
        project_template TEXT,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    name: '002_create_employees',
    sql: `
      CREATE TABLE IF NOT EXISTS public.employees (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name              TEXT NOT NULL,
        role              TEXT NOT NULL DEFAULT 'worker',
        status            TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'inactive')),
        assigned_projects TEXT[] NOT NULL DEFAULT '{}',
        email             TEXT,
        phone             TEXT,
        employee_id       TEXT,
        classification    TEXT,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    name: '003_add_missing_project_columns',
    sql: `
      ALTER TABLE public.projects
        ADD COLUMN IF NOT EXISTS street_address   TEXT,
        ADD COLUMN IF NOT EXISTS city             TEXT,
        ADD COLUMN IF NOT EXISTS state            TEXT,
        ADD COLUMN IF NOT EXISTS zip_code         TEXT,
        ADD COLUMN IF NOT EXISTS country          TEXT DEFAULT 'United States',
        ADD COLUMN IF NOT EXISTS start_date       DATE,
        ADD COLUMN IF NOT EXISTS end_date         DATE,
        ADD COLUMN IF NOT EXISTS project_groups   TEXT,
        ADD COLUMN IF NOT EXISTS project_template TEXT;
    `,
  },
  {
    name: '004_add_missing_employee_columns',
    sql: `
      ALTER TABLE public.employees
        ADD COLUMN IF NOT EXISTS email          TEXT,
        ADD COLUMN IF NOT EXISTS phone          TEXT,
        ADD COLUMN IF NOT EXISTS employee_id    TEXT,
        ADD COLUMN IF NOT EXISTS classification TEXT;
    `,
  },
  {
    name: '005_updated_at_trigger',
    sql: `
      CREATE OR REPLACE FUNCTION public.touch_updated_at()
      RETURNS TRIGGER LANGUAGE plpgsql AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$;

      DROP TRIGGER IF EXISTS projects_updated_at  ON public.projects;
      CREATE TRIGGER projects_updated_at
        BEFORE UPDATE ON public.projects
        FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

      DROP TRIGGER IF EXISTS employees_updated_at ON public.employees;
      CREATE TRIGGER employees_updated_at
        BEFORE UPDATE ON public.employees
        FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
    `,
  },
  {
    name: '006a_add_dashboard_project_columns',
    sql: `
      ALTER TABLE public.projects
        ADD COLUMN IF NOT EXISTS job_number       TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS status           TEXT NOT NULL DEFAULT 'active'
                                                    CHECK (status IN ('active','paused','completed')),
        ADD COLUMN IF NOT EXISTS acres_completed  NUMERIC(8,1) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT now();
    `,
  },
  {
    name: '006b_seed_mock_projects',
    sql: `
      INSERT INTO public.projects
        (name, job_number, status, city, state, zip_code, country, start_date, project_template, acres_completed)
      SELECT * FROM (VALUES
        ('ARTIFACT SOLAR SITE',                       '00000', 'active', 'Fort Myers',     'FL', '33901', 'United States', '2026-02-11'::date, 'Infrastructure Template',                         0::numeric),
        ('Big Water Wicking Project',                 '00009', 'active', 'Big Pine Key',   'FL', '33034', 'United States', '2025-04-24'::date, 'Wicking Jobs Template | Company default template', 0::numeric),
        ('Caloosahatchee Wicking Project',            '00006', 'active', 'LaBelle',        'FL', '33440', 'United States', '2025-02-01'::date, 'Wicking Jobs Template | Company default template', 0::numeric),
        ('Citrus Wicking Project',                    '00022', 'active', 'Inverness',      'FL', '34266', 'United States', '2025-01-02'::date, 'Wicking Jobs Template | Company default template', 0::numeric),
        ('Everglades/Clyman Property Wicking Project','00020', 'active', 'Ochopee',        'FL', '33170', 'United States', '2025-06-25'::date, 'Environmental Project Template',                   0::numeric),
        ('Green Pasture Wicking Project',             '00010', 'active', 'Arcadia',        'FL', '33982', 'United States', '2025-04-24'::date, 'Wicking Jobs Template | Company default template', 0::numeric),
        ('Harmony II Wicking Project',                '00016', 'active', 'Harmony',        'FL', '34773', 'United States', '2025-04-24'::date, 'Wicking Jobs Template | Company default template', 0::numeric),
        ('Hendry Isles Wicking Project',              '00005', 'active', 'Clewiston',      'FL', '33440', 'United States', '2025-03-25'::date, 'Wicking Jobs Template | Company default template', 0::numeric),
        ('Hog Bay Wicking Project',                   '00007', 'active', 'Everglades City','FL', '34266', 'United States', '2025-04-28'::date, 'Environmental Project Template',                   0::numeric),
        ('Honey Bell Wicking Project',                '00011', 'active', 'Lake Placid',    'FL', '33771', 'United States', '2025-04-24'::date, 'Wicking Jobs Template | Company default template', 0::numeric),
        ('Lakeside Wicking Project',                  '00003', 'active', 'Sebring',        'FL', '33974', 'United States', '2025-03-24'::date, 'Wicking Jobs Template | Company default template', 0::numeric),
        ('Loggerhead Wicking Project',                '00004', 'active', 'Key West',       'FL', '33987', 'United States', '2025-03-25'::date, 'Environmental Project Template',                   0::numeric),
        ('Storey Bend Wicking Project',               '00001', 'active', 'Kissimmee',      'FL', '34741', 'United States', '2025-01-10'::date, 'Wicking Jobs Template | Company default template', 29.8::numeric),
        ('Redlands Wicking Project',                  '00002', 'active', 'Homestead',      'FL', '33033', 'United States', '2025-02-14'::date, 'Environmental Project Template',                   15.2::numeric),
        ('Oakwood Infrastructure',                    '00015', 'active', 'Naples',         'FL', '34104', 'United States', '2025-05-01'::date, 'Infrastructure Template',                         0::numeric)
      ) AS v(name, job_number, status, city, state, zip_code, country, start_date, project_template, acres_completed)
      WHERE NOT EXISTS (SELECT 1 FROM public.projects LIMIT 1);
    `,
  },
  {
    name: '007_create_activities',
    sql: `
      CREATE TABLE IF NOT EXISTS public.activities (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_name    TEXT NOT NULL,
        action           TEXT NOT NULL,
        project_name     TEXT NOT NULL,
        activity_type    TEXT NOT NULL,
        timestamp_label  TEXT NOT NULL,
        metrics          JSONB NOT NULL DEFAULT '[]'::jsonb,
        photos           TEXT[] NOT NULL DEFAULT '{}',
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
  {
    name: '008_add_client_name_to_projects',
    sql: `
      ALTER TABLE public.projects
        ADD COLUMN IF NOT EXISTS client_name TEXT;
    `,
  },
];


// ─── Runner ───────────────────────────────────────────────────────────────────
async function migrate() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('🔌  Connected to Supabase\n');

  let passed = 0;
  let failed = 0;

  for (const m of migrations) {
    process.stdout.write(`  ⏳  ${m.name} … `);
    try {
      await client.query(m.sql);
      console.log('✅');
      passed++;
    } catch (err) {
      console.log(`❌\n      ${err.message}`);
      failed++;
    }
  }

  await client.end();

  console.log(`\n─────────────────────────────────────`);
  console.log(`  ${passed} passed  |  ${failed} failed`);
  if (failed === 0) {
    console.log('  🚀  Database is up to date!');
  } else {
    console.log('  ⚠️   Some migrations failed — check errors above.');
    process.exit(1);
  }
}

migrate().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
