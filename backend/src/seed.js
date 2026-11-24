// Creates default admin: admin@example.com / Admin@123
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

(async () => {
  await db.query(
    `INSERT INTO users (name,email,password,address,role)
     VALUES ('System Administrator Account','admin@example.com',$1,'Head Office','admin')
     ON CONFLICT (email) DO NOTHING`,
    [await bcrypt.hash('Admin@123', 10)]
  );
  console.log('Admin ready: admin@example.com / Admin@123');
  process.exit(0);
})();
