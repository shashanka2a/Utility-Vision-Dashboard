const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.SUPABASE_DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query(`
    select table_name, column_name, data_type 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name in ('notes', 'chemicals_logs', 'metrics', 'equipment_logs', 'incidents', 'observations', 'safety_talks', 'daily_signed_reports', 'chemical_applications')
    order by table_name, ordinal_position;
  `);
  
  const tables = {};
  res.rows.forEach(r => {
    if (!tables[r.table_name]) tables[r.table_name] = [];
    tables[r.table_name].push(r.column_name); // + ' (' + r.data_type + ')');
  });

  for (const t in tables) {
    console.log(t, ":\\n  ", tables[t].join(", "));
  }
  await client.end();
}
main();
