/**
 * Seed Script for Development/Testing
 *
 * Populates Firestore with sample machines and products.
 * Run with: npm run seed
 */

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin with service account
// In development, this uses the emulator or default credentials
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

try {
  const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf-8');
  const serviceAccount = JSON.parse(serviceAccountJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  // If no service account, use default credentials (for emulator)
  admin.initializeApp();
}

const db = admin.firestore();

// ============================================
// SAMPLE DATA
// ============================================

const machines = [
  {
    id: 'machine-001',
    data: {
      location: 'Building A, Floor 1 - Lobby',
      status: 'online',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'machine-002',
    data: {
      location: 'Building B, Floor 3 - Cafeteria',
      status: 'online',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'test-machine-001',
    data: {
      location: 'Test Machine - Development',
      status: 'online',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
];

const products = [
  // Machine 001 Products
  {
    id: 'prod-001',
    data: {
      name: 'Coca Cola 500ml',
      price: 40,
      stock: 15,
      machineId: 'machine-001',
      imageUrl:
        'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200',
      category: 'beverages',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'prod-002',
    data: {
      name: 'Pepsi 500ml',
      price: 40,
      stock: 12,
      machineId: 'machine-001',
      imageUrl:
        'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=200',
      category: 'beverages',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'prod-003',
    data: {
      name: 'Lays Classic Chips',
      price: 20,
      stock: 8,
      machineId: 'machine-001',
      imageUrl:
        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200',
      category: 'snacks',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'prod-004',
    data: {
      name: 'KitKat Chocolate',
      price: 30,
      stock: 20,
      machineId: 'machine-001',
      imageUrl:
        'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=200',
      category: 'snacks',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'prod-005',
    data: {
      name: 'Mineral Water 1L',
      price: 25,
      stock: 25,
      machineId: 'machine-001',
      imageUrl:
        'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200',
      category: 'beverages',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },

  // Machine 002 Products
  {
    id: 'prod-006',
    data: {
      name: 'Red Bull Energy Drink',
      price: 125,
      stock: 10,
      machineId: 'machine-002',
      imageUrl:
        'https://images.unsplash.com/photo-1613313254538-e0e7a32d568c?w=200',
      category: 'beverages',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'prod-007',
    data: {
      name: 'Oreo Cookies',
      price: 35,
      stock: 15,
      machineId: 'machine-002',
      imageUrl:
        'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200',
      category: 'snacks',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },

  // Test Machine Products
  {
    id: 'test-prod-001',
    data: {
      name: 'Test Cola',
      price: 10, // Low price for testing
      stock: 5,
      machineId: 'test-machine-001',
      imageUrl:
        'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200',
      category: 'beverages',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'test-prod-002',
    data: {
      name: 'Test Chips',
      price: 5, // Very low price for testing
      stock: 3,
      machineId: 'test-machine-001',
      imageUrl:
        'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200',
      category: 'snacks',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
  {
    id: 'test-prod-003',
    data: {
      name: 'Out of Stock Item',
      price: 15,
      stock: 0, // Zero stock for testing
      machineId: 'test-machine-001',
      imageUrl:
        'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=200',
      category: 'snacks',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  },
];

// ============================================
// SEED FUNCTION
// ============================================

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Seed Machines
    console.log('📦 Seeding machines...');
    for (const machine of machines) {
      await db.collection('machines').doc(machine.id).set(machine.data);
      console.log(`  ✅ Created machine: ${machine.id}`);
    }

    // Seed Products
    console.log('\n🛒 Seeding products...');
    for (const product of products) {
      await db.collection('products').doc(product.id).set(product.data);
      console.log(`  ✅ Created product: ${product.data.name} (${product.id})`);
    }

    console.log('\n✨ Database seeded successfully!');
    console.log('\n📋 Test URLs:');
    console.log('  • Machine 001: http://localhost:3000/machine/machine-001');
    console.log('  • Machine 002: http://localhost:3000/machine/machine-002');
    console.log(
      '  • Test Machine: http://localhost:3000/machine/test-machine-001',
    );
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seed
seedDatabase();
