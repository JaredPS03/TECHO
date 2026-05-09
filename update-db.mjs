import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function updateDb() {
  try {
    const c = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'techo'
    });

    try {
      await c.query('ALTER TABLE admin_users ADD COLUMN password_hash VARCHAR(255) NOT NULL');
      console.log('Added password_hash column');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Column password_hash already exists');
      } else {
        throw e;
      }
    }

    const hash = await bcrypt.hash('admin123', 10);
    const [res] = await c.query(
      'INSERT IGNORE INTO admin_users (id, email, password_hash) VALUES (UUID(), ?, ?)',
      ['admin@techo.org', hash]
    );
    console.log('Inserted default admin (admin@techo.org / admin123):', res.affectedRows > 0 ? 'Yes' : 'Already exists');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateDb();
