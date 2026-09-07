/**
 * Creates (or updates) an admin user.
 *
 *   ADMIN_EMAIL=you@example.org ADMIN_PASSWORD='<a strong password>' node scripts/create-admin.mjs
 *
 * The password is read from the environment and only its bcrypt hash is ever
 * stored. Never hard-code a credential in this file: everything committed here
 * is permanent, and a password in git history stays readable even after the
 * line is deleted.
 */
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.')
  process.exit(1)
}

if (password.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters long.')
  process.exit(1)
}

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'techo',
  port: Number(process.env.MYSQL_PORT || 3306),
})

try {
  const hash = await bcrypt.hash(password, 12)

  const [result] = await connection.query(
    `INSERT INTO admin_users (id, email, password_hash)
     VALUES (UUID(), ?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [email.toLowerCase(), hash]
  )

  console.log(
    result.affectedRows > 1
      ? `Password updated for ${email}.`
      : `Admin ${email} created.`
  )
} catch (error) {
  console.error('Error creating the admin user:', error)
  process.exitCode = 1
} finally {
  await connection.end()
}
