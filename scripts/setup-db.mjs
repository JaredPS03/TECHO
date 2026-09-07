/**
 * Creates the database and applies database.sql.
 *
 *   node scripts/setup-db.mjs
 *
 * Reads connection details from the environment (see .env.example) and falls
 * back to a local XAMPP/MySQL default.
 */
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.join(__dirname, '..', 'database.sql')

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  port: Number(process.env.MYSQL_PORT || 3306),
}

const database = process.env.MYSQL_DATABASE || 'techo'

async function setup() {
  const connection = await mysql.createConnection(config)

  console.log(`Creating database "${database}" if it does not exist...`)
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``)
  await connection.changeUser({ database })

  console.log('Applying database.sql...')
  const sql = fs.readFileSync(schemaPath, 'utf-8')
  const statements = sql.split(';').filter((stmt) => stmt.trim().length > 0)

  for (const statement of statements) {
    console.log(`  ${statement.trim().split('\n')[0].slice(0, 60)}...`)
    await connection.query(statement)
  }

  await connection.end()
  console.log('\nSchema ready. Create the admin user with: node scripts/create-admin.mjs')
}

setup().catch((error) => {
  console.error('Error setting up the database:', error)
  process.exit(1)
})
