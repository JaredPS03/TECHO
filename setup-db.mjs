import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
  try {
    console.log("Connecting to MySQL...");
    // Connect without database first
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log("Creating database 'techo' if not exists...");
    await connection.query("CREATE DATABASE IF NOT EXISTS techo");
    
    console.log("Using database 'techo'...");
    await connection.query("USE techo");

    console.log("Reading database.sql...");
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf-8');
    
    // Split by semicolons, ignoring empty statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const stmt of statements) {
      console.log(`Executing: ${stmt.trim().substring(0, 50)}...`);
      await connection.query(stmt);
    }

    console.log("Database setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

setup();
