/**
 * Database Seeder
 * Creates default accounts and sample data
 * Run: node backend/utils/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db     = require('../models/db');
const { encrypt } = require('./crypto');

async function seed() {
  console.log('[Seed] Starting database seeding...');

  // Default users
  const users = [
    { first_name: 'Admin',    last_name: 'Manager',  email: 'manager@cowork.com',  password: 'Manager@123',  phone: '0800000001', address: '1 Manager St, Bangkok', role: 'manager'  },
    { first_name: 'Jane',     last_name: 'Employee', email: 'employee@cowork.com', password: 'Employee@123', phone: '0800000002', address: '2 Employee St, Bangkok', role: 'employee' },
    { first_name: 'John',     last_name: 'Customer', email: 'customer@cowork.com', password: 'Customer@123', phone: '0800000003', address: '3 Customer St, Bangkok', role: 'customer' },
  ];

  for (const u of users) {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing.length) { console.log(`[Seed] User ${u.email} already exists, skipping`); continue; }
    const hashed = await bcrypt.hash(u.password, 12);
    await db.execute(
      'INSERT INTO users (first_name, last_name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u.first_name, u.last_name, u.email, hashed, encrypt(u.phone), encrypt(u.address), u.role]
    );
    console.log(`[Seed] Created user: ${u.email} (${u.role})`);
  }

  // Spaces
  const [spaces] = await db.execute('SELECT id FROM spaces');
  if (!spaces.length) {
    await db.execute(
      "INSERT INTO spaces (name, total_desks, description) VALUES ('Main Floor', 30, 'Open co-working floor'), ('Private Pods', 10, 'Semi-private pods'), ('Conference Room', 5, 'Meeting room')"
    );
    console.log('[Seed] Created spaces');
  }

  // Inventory
  const [inv] = await db.execute('SELECT id FROM inventory');
  if (!inv.length) {
    const items = [
      ['Standard Desk',    'desk',         30, 'unit'],
      ['Ergonomic Chair',  'chair',        40, 'unit'],
      ['Power Strip',      'power_outlet', 20, 'unit'],
      ['Desktop Computer', 'computer',     10, 'unit'],
      ['Coffee',           'snack',       100, 'cup'],
      ['Snack Bar',        'snack',        50, 'item'],
    ];
    for (const [name, cat, qty, unit] of items) {
      await db.execute('INSERT INTO inventory (item_name, category, quantity, unit) VALUES (?, ?, ?, ?)', [name, cat, qty, unit]);
    }
    console.log('[Seed] Created inventory');
  }

  // CCTV
  const [cams] = await db.execute('SELECT id FROM cctv_cameras');
  if (!cams.length) {
    const cameras = [
      ['CAM-01', 'Main Entrance'],
      ['CAM-02', 'Main Floor'],
      ['CAM-03', 'Private Pods'],
      ['CAM-04', 'Conference Room'],
    ];
    for (const [name, loc] of cameras) {
      await db.execute('INSERT INTO cctv_cameras (name, location) VALUES (?, ?)', [name, loc]);
    }
    console.log('[Seed] Created CCTV cameras');
  }

  // Sample membership for customer
  const [custRows] = await db.execute("SELECT id FROM users WHERE email = 'customer@cowork.com'");
  if (custRows.length) {
    const custId = custRows[0].id;
    const [memRows] = await db.execute('SELECT id FROM memberships WHERE user_id = ?', [custId]);
    if (!memRows.length) {
      const start = new Date().toISOString().slice(0, 10);
      const end   = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      await db.execute(
        'INSERT INTO memberships (user_id, type, start_date, end_date) VALUES (?, ?, ?, ?)',
        [custId, 'monthly', start, end]
      );
      console.log('[Seed] Created sample membership for customer');
    }
  }

  console.log('[Seed] Seeding complete!');
  process.exit(0);
}

seed().catch(err => { console.error('[Seed] Error:', err); process.exit(1); });
