import { Client } from 'pg';
import "dotenv/config";

const connectionString = process.env.SUPABASE_DB_CONNECTION_STRING;

if (!connectionString) {
  console.error("Please ensure SUPABASE_DB_CONNECTION_STRING is set in .env");
  process.exit(1);
}

const client = new Client({ connectionString });

async function main() {
  await client.connect();
  console.log("Connected to the database. Running reseed script...");

  try {
    // 1. Clear existing non-essential data
    await client.query('DELETE FROM projects;');
    await client.query('DELETE FROM employees;');
    console.log("Cleared existing projects and employees.");

    // 2. Insert new projects
    const projects = [
      {
        name: "Solar Artifact Site",
        job_number: "SAS-100",
        state: "FL",
        status: "active",
        project_template: "Wicking Project"
      },
      {
        name: "Big Water Wicking Project",
        job_number: "BWC-202",
        state: "FL",
        status: "active",
        project_template: "Wicking Project"
      }
    ];

    const projectQuery = `
      INSERT INTO projects (name, job_number, state, status, project_template)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name;
    `;

    for (const p of projects) {
      const res = await client.query(projectQuery, [p.name, p.job_number, p.state, p.status, p.project_template]);
      console.log(`Inserted project: ${res.rows[0].name}`);
    }

    // 3. Insert test employee
    const employeeQuery = `
      INSERT INTO employees (name, role, status, email, phone, employee_id, classification)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name;
    `;

    const empRes = await client.query(employeeQuery, [
      "Test Employee",
      "Field Worker",
      "active",
      "test.employee@example.com",
      "555-0100",
      "EMP-TEST",
      "FT"
    ]);
    console.log(`Inserted test employee: ${empRes.rows[0].name}`);

  } catch (error) {
    console.error("Error running reseed:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

main();
