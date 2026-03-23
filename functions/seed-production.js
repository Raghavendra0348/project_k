/**
 * Seed PRODUCTION Firestore with correct product data.
 * 
 * Uses Firebase CLI credentials (no service account key needed).
 * Run: node seed-production.js
 * 
 * This will:
 * 1. Delete old products (prod-001, prod-002, etc.)
 * 2. Create new products with correct IDs (prod-001-coke, etc.)
 * 3. Update machine documents
 */

// DO NOT set FIRESTORE_EMULATOR_HOST — this writes to production
delete process.env.FIRESTORE_EMULATOR_HOST;

const admin = require('firebase-admin');
const path = require('path');

// Use service account key for authentication
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
        projectId: 'vending-machine-web',
        credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const machines = [
        { id: 'machine-001', location: 'Building A, Floor 1 - Lobby', status: 'online', name: 'Building A Lobby' },
        { id: 'machine-002', location: 'Building B, Floor 3 - Cafeteria', status: 'online', name: 'Building B Cafeteria' },
        { id: 'test-machine-001', location: 'Test Location - Development', status: 'online', name: 'Test Machine (Dev)' },
];

const products = [
        // Machine 001 — 11 products
        { id: 'prod-001-coke', machineId: 'machine-001', name: 'Coca Cola 500ml', price: 40, stock: 25, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', description: 'Refreshing cola drink', trending: { isTrending: true, rank: 2, reason: 'Popular cola beverage' }, salesData: { lastWeek: 87, trend: 'up', percentChange: 15 } },
        { id: 'prod-001-pepsi', machineId: 'machine-001', name: 'Pepsi 500ml', price: 40, stock: 20, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', description: 'Classic Pepsi', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 65, trend: 'up', percentChange: 8 } },
        { id: 'prod-001-water', machineId: 'machine-001', name: 'Bisleri Water 500ml', price: 20, stock: 50, category: 'water', imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400', description: 'Pure mineral water', trending: { isTrending: true, rank: 1, reason: 'Essential hydration - High demand' }, salesData: { lastWeek: 95, trend: 'up', percentChange: 12 } },
        { id: 'prod-001-water-1l', machineId: 'machine-001', name: 'Mineral Water 1L', price: 25, stock: 35, category: 'water', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', description: 'Large mineral water bottle', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 42, trend: 'up', percentChange: 5 } },
        { id: 'prod-001-lays', machineId: 'machine-001', name: 'Lays Classic Chips', price: 20, stock: 30, category: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', description: 'Crispy potato chips', trending: { isTrending: true, rank: 4, reason: 'Snack time favorite' }, salesData: { lastWeek: 48, trend: 'up', percentChange: 10 } },
        { id: 'prod-001-kurkure', machineId: 'machine-001', name: 'Kurkure Masala Munch', price: 20, stock: 25, category: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1613919228350-e0447a7b7f4c?w=400', description: 'Crunchy spicy snack', trending: { isTrending: true, rank: 5, reason: 'Spicy snack trending' }, salesData: { lastWeek: 54, trend: 'up', percentChange: 12 } },
        { id: 'prod-001-pringles', machineId: 'machine-001', name: 'Pringles Original', price: 60, stock: 12, category: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f68d0b?w=400', description: 'Stackable chips', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 28, trend: 'up', percentChange: 15 } },
        { id: 'prod-001-kitkat', machineId: 'machine-001', name: 'KitKat Chocolate', price: 30, stock: 28, category: 'chocolates', imageUrl: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400', description: 'Crispy wafer chocolate', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 35, trend: 'up', percentChange: 12 } },
        { id: 'prod-001-dairymilk', machineId: 'machine-001', name: 'Cadbury Dairy Milk', price: 50, stock: 22, category: 'chocolates', imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400', description: 'Classic milk chocolate', trending: { isTrending: true, rank: 7, reason: 'India\'s favorite chocolate' }, salesData: { lastWeek: 52, trend: 'up', percentChange: 14 } },
        { id: 'prod-001-snickers', machineId: 'machine-001', name: 'Snickers Bar', price: 35, stock: 18, category: 'chocolates', imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', description: 'Chocolate with peanuts', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 31, trend: 'up', percentChange: 10 } },
        { id: 'prod-001-frooti', machineId: 'machine-001', name: 'Frooti Mango Drink', price: 30, stock: 24, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', description: 'Fresh mango drink', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 35, trend: 'up', percentChange: 18 } },

        // Machine 002 — 9 products
        { id: 'prod-002-coke', machineId: 'machine-002', name: 'Coca Cola 500ml', price: 40, stock: 30, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', description: 'Refreshing cola drink', trending: { isTrending: true, rank: 2, reason: 'Popular cola beverage' }, salesData: { lastWeek: 92, trend: 'up', percentChange: 18 } },
        { id: 'prod-002-sprite', machineId: 'machine-002', name: 'Sprite 500ml', price: 40, stock: 25, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', description: 'Lemon lime soda', trending: { isTrending: true, rank: 3, reason: 'Popular lime soda' }, salesData: { lastWeek: 42, trend: 'up', percentChange: 9 } },
        { id: 'prod-002-redbull', machineId: 'machine-002', name: 'Red Bull Energy Drink', price: 125, stock: 15, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1613313254538-e0e7a32d568c?w=400', description: 'Energy drink', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 25, trend: 'up', percentChange: 20 } },
        { id: 'prod-002-monster', machineId: 'machine-002', name: 'Monster Energy', price: 130, stock: 10, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34f5a006?w=400', description: 'Monster energy drink', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 22, trend: 'up', percentChange: 18 } },
        { id: 'prod-002-water', machineId: 'machine-002', name: 'Aquafina Water 1L', price: 25, stock: 40, category: 'water', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', description: 'Purified water', trending: { isTrending: true, rank: 1, reason: 'Essential hydration - High demand' }, salesData: { lastWeek: 48, trend: 'up', percentChange: 8 } },
        { id: 'prod-002-oreo', machineId: 'machine-002', name: 'Oreo Cookies', price: 35, stock: 20, category: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400', description: 'Chocolate sandwich cookies', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 45, trend: 'up', percentChange: 8 } },
        { id: 'prod-002-doritos', machineId: 'machine-002', name: 'Doritos Nacho Cheese', price: 55, stock: 16, category: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400', description: 'Cheesy tortilla chips', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 28, trend: 'stable', percentChange: 1 } },
        { id: 'prod-002-mars', machineId: 'machine-002', name: 'Mars Bar', price: 38, stock: 14, category: 'chocolates', imageUrl: 'https://images.unsplash.com/photo-1595495055755-1117d0572a87?w=400', description: 'Chocolate caramel bar', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 18, trend: 'down', percentChange: -5 } },
        { id: 'prod-002-maggi', machineId: 'machine-002', name: 'Maggi Noodles', price: 25, stock: 20, category: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', description: '2-minute noodles', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 52, trend: 'up', percentChange: 30 } },

        // Test machine — 2 products
        { id: 'prod-test-coke', machineId: 'test-machine-001', name: 'Test Coca Cola', price: 1, stock: 100, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', description: 'Test product', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 5, trend: 'stable', percentChange: 0 } },
        { id: 'prod-test-chips', machineId: 'test-machine-001', name: 'Test Chips', price: 1, stock: 100, category: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', description: 'Test product', trending: { isTrending: false, rank: 0, reason: '' }, salesData: { lastWeek: 3, trend: 'stable', percentChange: 0 } },
];

// Old product IDs to clean up from production
const oldProductIds = ['prod-001', 'prod-002', 'prod-003', 'prod-004', 'prod-005', 'prod-006', 'prod-007', 'test-prod-001', 'test-prod-002'];

async function seedProduction() {
        console.log('🌱 Seeding PRODUCTION Firestore...\n');
        console.log('⚠️  This writes to PRODUCTION (not emulator)\n');

        try {
                // Step 1: Delete old products with wrong IDs
                console.log('🗑️  Deleting old products...');
                for (const id of oldProductIds) {
                        const doc = await db.collection('products').doc(id).get();
                        if (doc.exists) {
                                await db.collection('products').doc(id).delete();
                                console.log(`  ❌ Deleted: ${id}`);
                        }
                }

                // Step 2: Upsert machines
                console.log('\n📦 Seeding machines...');
                for (const machine of machines) {
                        await db.collection('machines').doc(machine.id).set({
                                location: machine.location,
                                status: machine.status,
                                name: machine.name,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        }, { merge: true });
                        console.log(`  ✅ ${machine.id}: ${machine.name}`);
                }

                // Step 3: Seed all products with correct IDs
                console.log('\n🛍️  Seeding products...');
                for (const product of products) {
                        await db.collection('products').doc(product.id).set({
                                machineId: product.machineId,
                                name: product.name,
                                price: product.price,
                                stock: product.stock,
                                category: product.category,
                                imageUrl: product.imageUrl,
                                description: product.description,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        console.log(`  ✅ ${product.id}: ${product.name} → ${product.machineId}`);
                }

                const m001 = products.filter(p => p.machineId === 'machine-001').length;
                const m002 = products.filter(p => p.machineId === 'machine-002').length;
                const test = products.filter(p => p.machineId === 'test-machine-001').length;

                console.log('\n✅ Production Firestore seeded successfully!');
                console.log(`  machine-001: ${m001} products`);
                console.log(`  machine-002: ${m002} products`);
                console.log(`  test-machine-001: ${test} products`);
                console.log(`  Total: ${products.length} products`);

                process.exit(0);
        } catch (error) {
                console.error('\n❌ Error:', error.message);
                process.exit(1);
        }
}

seedProduction();
