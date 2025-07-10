const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'bloguser',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'blogdb',
  password: process.env.DB_PASSWORD || 'blogpass',
  port: process.env.DB_PORT || 5432,
});

module.exports = { pool };