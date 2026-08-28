import pkg from 'pg';
const { Pool } = pkg;

// Render proporciona automáticamente la variable DATABASE_URL en producción
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://gestion_financiera_db_5wsf_user:swXDcTAXro7SflfBhCg2ouOZcSEkmV3J@dpg-da8r4hvavr4c73f1f1i0-a/gestion_financiera_db_5wsf',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    // Creación de tablas para PostgreSQL
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) CHECK (type IN ('ingreso', 'gasto', 'ahorro')),
        group_type VARCHAR(20) DEFAULT 'ninguno',
        color VARCHAR(20) DEFAULT '#64748b'
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) CHECK (type IN ('ingreso', 'gasto', 'ahorro')),
        amount NUMERIC(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        note TEXT
      );

      CREATE TABLE IF NOT EXISTS saving_goals (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        target NUMERIC(10, 2) NOT NULL,
        current NUMERIC(10, 2) DEFAULT 0,
        color VARCHAR(30) DEFAULT 'bg-emerald-500'
      );
    `);
    console.log('Tablas de PostgreSQL inicializadas correctamente.');
  } finally {
    client.release();
  }
};

export const query = (text, params) => pool.query(text, params);