import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const sql = neon(process.env.NEON_DATABASE_URL || 'postgresql://dummy:dummy@ep-dummy.neon.tech/neondb?sslmode=require');

async function main() {
  try {
    const migration = fs.readFileSync(path.join(process.cwd(), 'neon', 'migrations', '00001_initial_schema.sql'), 'utf-8');
    // Neon driver doesn't support multiple statements natively in a single query sometimes unless we split or use transaction if supported.
    // However, @neondatabase/serverless supports running raw strings if passed. Let's try splitting by `;` OR just running it.
    
    // Instead of raw string, neon supports passing the query as a string.
    console.log("Running migrations...");
    const result = await sql(migration); // Use the string directly, not tag
    console.log("Migrations executed successfully:", result);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
