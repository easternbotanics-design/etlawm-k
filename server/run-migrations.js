import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'node:dns';

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: process.env.PG_HOST,
      port: parseInt(process.env.PG_PORT, 10),
      database: process.env.PG_DATABASE,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
    };

const pool = new pg.Pool(poolConfig);

async function run() {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found at ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).sort();

  console.log(`Found ${files.length} migration files in ${migrationsDir}.`);

  const client = await pool.connect();
  try {
    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      
      console.log(`Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`Successfully applied ${file}.`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed to apply ${file}:`, err.message);
        throw err;
      }
    }
    console.log('All migrations applied successfully!');
  } catch (err) {
    console.error('Migration execution stopped due to error.', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
