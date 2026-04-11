import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
  try {
    console.log('🔍 Checking database connection...');
    const pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pre_enrolment',
    });

    const conn = await pool.getConnection();
    console.log('✅ Database connected');

    console.log('\n🔍 Checking users table...');
    const [tables] = await conn.query(`SHOW TABLES LIKE 'users'`);
    if (tables.length === 0) {
      console.log('❌ Users table does not exist');
      conn.release();
      process.exit(1);
    }
    console.log('✅ Users table exists');

    console.log('\n🔍 Checking for admin user...');
    const [admins] = await conn.query(
      'SELECT email, password, name, role FROM users WHERE email = ?',
      ['admin@cihe.edu']
    );

    if (admins.length === 0) {
      console.log('❌ Admin user NOT found');
      console.log('\n⚠️ SOLUTION: You need to seed the database with demo data');
      console.log('   1. Make sure backend is running: npm run api:dev');
      console.log('   2. The app should auto-seed when you load it');
      console.log('   3. Or manually POST to http://localhost:4000/api/setup/seed');
    } else {
      const admin = admins[0];
      console.log('✅ Admin user found:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Password: ${admin.password}`);
    }

    console.log('\n🔍 All users in database:');
    const [allUsers] = await conn.query('SELECT email, name, role FROM users ORDER BY email');
    if (allUsers.length === 0) {
      console.log('   (None - database is empty)');
    } else {
      allUsers.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    }

    conn.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnose();
