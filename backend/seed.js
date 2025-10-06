require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log('⏳ Seeding database...');

    // 1. Add a sample company
    const companyRes = await pool.query(
      `INSERT INTO companies (name) VALUES ($1) RETURNING id`,
      ['A to B Lawn Care LLC']
    );
    const companyId = companyRes.rows[0].id;

    // 2. Add an admin user with bcrypt password
    const passwordHash = bcrypt.hashSync('password123', 10); // Change 'password123' if needed
    await pool.query(
      `INSERT INTO users (company_id, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [companyId, 'admin@atoblawncare.org', passwordHash, 'admin']
    );

    // 3. Add a sample property
    await pool.query(
      `INSERT INTO properties (company_id, name, address, notes)
       VALUES ($1, $2, $3, $4)`,
      [companyId, 'Sample Property', '123 Main St, Jacksonville, FL', 'Front yard needs weekly mowing']
    );

    console.log('✅ Database seeded successfully.');
    await pool.end();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    await pool.end();
    process.exit(1);
  }
}

seed();