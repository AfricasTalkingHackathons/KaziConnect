const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createDB = async () => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'postgres'
  });
  
  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='kaziconnect_db'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE kaziconnect_db');
      console.log('Database created');
    }
  } catch (err) {
    console.error('Error creating db:', err);
  } finally {
    await client.end();
  }
};

const initSchema = async () => {
  const { pool } = require('../db');
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255)');
    } catch (e) {
      console.error('Warning: could not add password column. May already exist.', e.message);
    }
    console.log('Schema initialized');
  } catch (err) {
    console.error('Error initializing schema:', err);
  }
};

const run = async () => {
  await createDB();
  await initSchema();
  process.exit(0);
};

run();
