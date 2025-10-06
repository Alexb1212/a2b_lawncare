// migrate.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  try {
    const migrationPath = path.join(__dirname, 'src/migrations/init.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('⏳ Running migrations...');
    await pool.query(sql);
    console.log('✅ Migrations completed successfully.');
    await pool.end();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();
