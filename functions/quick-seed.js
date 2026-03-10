const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({ projectId: 'vending-machine-web' });

const db = admin.firestore();

const machines = [
  { id: 'machine-001', location: 'Building A, Floor 1 - Lobby', status: 'online', name: 'Building A Lobby' },
  { id: 'machine-002', location: 'Building B, Floor 3 - Cafeteria', status: 'online', name: 'Building B Cafeteria' },
  { id: 'test-machine-001', location: 'Test Location - Development', status: 'online', name: 'Test Machine (Dev)' },
];

const products = [
  { id: 'prod-001', machineId: 'machine-001', name: 'Coca Cola 500ml', price: 40, stock: 15, category: 'Beverages', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7', description: 'Classic Coke' },
  { id: 'prod-002', machineId: 'machine-001', name: 'Lays Chips', price: 20, stock: 25, category: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b', description: 'Crispy chips' },
  { id: 'prod-003', machineId: 'machine-002', name: 'KitKat', price: 30, stock: 20, category: 'Chocolates', imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc', description: 'Chocolate wafer' },
];

async function seed() {
  try {
    console.log('Seeding...');
    for (const m of machines) {
      await db.collection('machines').doc(m.id).set(m);
      console.log(`✓ ${m.id}`);
    }
    for (const p of products) {
      await db.collection('products').doc(p.id).set(p);
      console.log(`✓ ${p.name}`);
    }
    console.log('✅ Done!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

seed();
