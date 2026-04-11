#!/usr/bin/env node

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'pre_enrolment',
});

async function checkAdminLogin() {
  try {
    console.log('🔍 Checking database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connected');

    console.log('\n🔍 Checking if users table exists...');
    const [tables] = await connection.query(`SHOW TABLES LIKE 'users'`);
    if (tables.length === 0) {
      console.log('❌ Users table does not exist');
      connection.release();
      process.exit(1);
    }
    console.log('✅ Users table exists');

    console.log('\n🔍 Checking admin user in database...');
    const [adminUsers] = await connection.query(
      'SELECT email, password, name, role FROM users WHERE email = ? LIMIT 1',
      ['admin@cihe.edu']
    );

    if (adminUsers.length === 0) {
      console.log('❌ Admin user not found in database');
      console.log('   Please run: POST http://localhost:4000/api/setup/seed with force:true');
    } else {
      const admin = adminUsers[0];
      console.log('✅ Admin user found:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Password stored: ${admin.password}`);
      
      if (admin.password === 'admin123') {
        console.log('✅ Password is correct (admin123)');
      } else {
        console.log(`❌ Password mismatch. Expected 'admin123', got '${admin.password}'`);
      }
    }

    console.log('\n🔍 Checking backend health...');
    try {
      const response = await fetch('http://localhost:4000/api/health');
      if (response.ok) {
        console.log('✅ Backend is running at http://localhost:4000');
      }
    } catch (e) {
      console.log('❌ Backend is NOT running at http://localhost:4000');
      console.log('   Start it with: npm run api:dev');
    }

    console.log('\n📝 Attempting login test...');
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@cihe.edu', password: 'admin123' })
      });
      const data = await response.json();
      if (response.ok) {
        console.log('✅ Login successful:', data);
      } else {
        console.log('❌ Login failed:', data);
      }
    } catch (e) {
      console.log('❌ Could not test login - backend not responding');
    }

    connection.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdminLogin().then(() => process.exit(0));
