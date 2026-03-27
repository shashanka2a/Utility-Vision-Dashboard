const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

const sql = `
  -- Drop the physical table if it exists
  DROP VIEW IF EXISTS public.activities;

  -- Create a unified view of all activity types
  CREATE OR REPLACE VIEW public.activities AS
  
  -- 1. Metrics
  SELECT 
    m.id,
    'Test Employee' AS employee_name,
    'submitted a material log in' AS action,
    p.name AS project_name,
    'Metrics' AS activity_type,
    to_char(m.logged_at, 'HH12:MI AM | YYYY-MM-DD "for" YYYY-MM-DD') AS timestamp_label,
    m.logged_at AS created_at,
    m.logged_at AS updated_at,
    m.photos,
    jsonb_build_array(
      jsonb_build_object('label', 'ACRES COMPLETED', 'value', COALESCE(m.acres_completed, 0)::text, 'unit', 'Acres', 'highlight', true)
    ) AS metrics
  FROM public.metrics m
  JOIN public.projects p ON p.id = m.project_id

  UNION ALL

  -- 2. Notes
  SELECT 
    n.id,
    'Test Employee' AS employee_name,
    'submitted a general note in' AS action,
    p.name AS project_name,
    'Notes' AS activity_type,
    to_char(n.logged_at, 'HH12:MI AM | YYYY-MM-DD "for" YYYY-MM-DD') AS timestamp_label,
    n.logged_at AS created_at,
    n.logged_at AS updated_at,
    n.photos,
    jsonb_build_array(
      jsonb_build_object(
        'label', 'NOTE: ' || COALESCE(n.category, 'General'), 
        'value', COALESCE(n.notes_text, ''), 
        'unit', '', 
        'highlight', true
      )
    ) AS metrics
  FROM public.notes n
  JOIN public.projects p ON p.id = n.project_id

  UNION ALL

  -- 3. Equipment Logs
  SELECT 
    e.id,
    'Test Employee' AS employee_name,
    'submitted equipment maintenance log in' AS action,
    p.name AS project_name,
    'Checklists' AS activity_type,
    to_char(e.logged_at, 'HH12:MI AM | YYYY-MM-DD "for" YYYY-MM-DD') AS timestamp_label,
    e.logged_at AS created_at,
    e.logged_at AS updated_at,
    e.photos,
    jsonb_build_array(
      jsonb_build_object('label', 'EQUIPMENT: ' || COALESCE(e.value, ''), 'value', '1', 'unit', COALESCE(e.unit, 'session'), 'highlight', true)
    ) AS metrics
  FROM public.equipment_logs e
  JOIN public.projects p ON p.id = e.project_id

  UNION ALL

  -- 4. Chemicals Logs
  SELECT 
    c.id,
    'Test Employee' AS employee_name,
    'submitted a chemical log in' AS action,
    p.name AS project_name,
    'Chemicals' AS activity_type,
    to_char(c.logged_at, 'HH12:MI AM | YYYY-MM-DD "for" YYYY-MM-DD') AS timestamp_label,
    c.logged_at AS created_at,
    c.logged_at AS updated_at,
    c.photos,
    jsonb_build_array(
      jsonb_build_object('label', 'SPRAYING: ' || COALESCE(c.application_type, ''), 'value', '1', 'unit', 'app', 'highlight', true)
    ) AS metrics
  FROM public.chemicals_logs c
  JOIN public.projects p ON p.id = c.project_id

  UNION ALL

  -- 5. Incidents
  SELECT 
    i.id,
    'Test Employee' AS employee_name,
    'reported an incident in' AS action,
    p.name AS project_name,
    'Incidents' AS activity_type,
    to_char(i.logged_at, 'HH12:MI AM | YYYY-MM-DD "for" YYYY-MM-DD') AS timestamp_label,
    i.logged_at AS created_at,
    i.logged_at AS updated_at,
    i.photos,
    jsonb_build_array(
      jsonb_build_object('label', 'INCIDENT', 'value', COALESCE(i.status, 'open'), 'unit', '', 'highlight', true)
    ) AS metrics
  FROM public.incidents i
  JOIN public.projects p ON p.id = i.project_id

  UNION ALL

  -- 6. Observations
  SELECT 
    o.id,
    'Test Employee' AS employee_name,
    'recorded an observation in' AS action,
    p.name AS project_name,
    'Observations' AS activity_type,
    to_char(o.logged_at, 'HH12:MI AM | YYYY-MM-DD "for" YYYY-MM-DD') AS timestamp_label,
    o.logged_at AS created_at,
    o.logged_at AS updated_at,
    o.attachments AS photos,
    jsonb_build_array(
      jsonb_build_object('label', 'OBSERVATION: ' || COALESCE(o.category, ''), 'value', COALESCE(o.type, ''), 'unit', '', 'highlight', true)
    ) AS metrics
  FROM public.observations o
  JOIN public.projects p ON p.id = o.project_id

  UNION ALL

  -- 7. Safety Talks
  SELECT 
    s.id,
    'Test Employee' AS employee_name,
    'held a safety talk in' AS action,
    p.name AS project_name,
    'Safety Talks' AS activity_type,
    to_char(s.created_at, 'HH12:MI AM | YYYY-MM-DD "for" YYYY-MM-DD') AS timestamp_label,
    s.created_at AS created_at,
    s.created_at AS updated_at,
    ARRAY[]::text[] AS photos,
    jsonb_build_array(
      jsonb_build_object('label', 'TOPIC: ' || COALESCE(s.template_name, ''), 'value', '1', 'unit', 'talk', 'highlight', true)
    ) AS metrics
  FROM public.safety_talks s
  JOIN public.projects p ON p.id = s.project_id;
`;

async function main() {
  await client.connect();
  console.log("Connected to the database. Creating unified activities View...");

  try {
    const res = await client.query(sql);
    console.log("Activities view created successfully!");
  } catch (error) {
    console.error("Error creating view:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

main();
