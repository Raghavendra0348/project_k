/**
 * Seed Script for Firebase Emulator
 * 
 * Simple script to populate Firestore emulator with test data
 */

const admin = require('firebase-admin');

// Connect to Firestore emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Initialize without credentials (emulator doesn't need them)
admin.initializeApp({
        projectId: 'vending-machine-web',
});

const db = admin.firestore();

// Disable settings that might cause delays
db.settings({
        ignoreUndefinedProperties: true,
});

const machines = [
        {
                id: 'machine-001',
                location: 'Building A, Floor 1 - Lobby',
                status: 'online',
                name: 'Building A Lobby',
        },
        {
                id: 'machine-002',
                location: 'Building B, Floor 3 - Cafeteria',
                status: 'online',
                name: 'Building B Cafeteria',
        },
        {
                id: 'test-machine-001',
                location: 'Test Location - Development',
                status: 'online',
                name: 'Test Machine (Dev)',
        },
];

const products = [
        // Machine 001 products
        {
                id: 'prod-001-coke',
                machineId: 'machine-001',
                name: 'Coca Cola',
                price: 40,
                stock: 25,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                description: 'Refreshing cola drink',
        },
        {
                id: 'prod-001-pepsi',
                machineId: 'machine-001',
                name: 'Pepsi',
                price: 40,
                stock: 20,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
                description: 'Classic Pepsi',
        },
        {
                id: 'prod-001-water',
                machineId: 'machine-001',
                name: 'Mineral Water',
                price: 20,
                stock: 50,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
                description: 'Pure mineral water',
        },
        {
                id: 'prod-001-lays',
                machineId: 'machine-001',
                name: 'Lays Classic',
                price: 20,
                stock: 30,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
                description: 'Crispy potato chips',
        },
        {
                id: 'prod-001-kurkure',
                machineId: 'machine-001',
                name: 'Kurkure',
                price: 20,
                stock: 25,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1613919228350-e0447a7b7f4c?w=400',
                description: 'Crunchy snack',
        },
        {
                id: 'prod-001-chocolate',
                machineId: 'machine-001',
                name: 'Dairy Milk',
                price: 50,
                stock: 15,
                category: 'chocolates',
                imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400',
                description: 'Cadbury chocolate',
        },

        // Machine 002 products
        {
                id: 'prod-002-coke',
                machineId: 'machine-002',
                name: 'Coca Cola',
                price: 40,
                stock: 30,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                description: 'Refreshing cola drink',
        },
        {
                id: 'prod-002-sprite',
                machineId: 'machine-002',
                name: 'Sprite',
                price: 40,
                stock: 25,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
                description: 'Lemon lime soda',
        },
        {
                id: 'prod-002-coffee',
                machineId: 'machine-002',
                name: 'Nescafe Coffee',
                price: 15,
                stock: 40,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
                description: 'Instant coffee',
        },
        {
                id: 'prod-002-biscuits',
                machineId: 'machine-002',
                name: 'Parle-G',
                price: 10,
                stock: 50,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
                description: 'Classic biscuits',
        },
        {
                id: 'prod-002-maggi',
                machineId: 'machine-002',
                name: 'Maggi Noodles',
                price: 25,
                stock: 20,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
                description: '2-minute noodles',
        },

        // Test machine products
        {
                id: 'prod-test-coke',
                machineId: 'test-machine-001',
                name: 'Test Coca Cola',
                price: 1,
                stock: 100,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                description: 'Test product',
        },
        {
                id: 'prod-test-chips',
                machineId: 'test-machine-001',
                name: 'Test Chips',
                price: 1,
                stock: 100,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
                description: 'Test product',
        },
];

async function seedDatabase() {
        console.log('🌱 Starting database seed for emulator...\n');

        try {
                // Seed machines
                console.log('📦 Seeding machines...');
                for (const machine of machines) {
                        await db.collection('machines').doc(machine.id).set({
                                location: machine.location,
                                status: machine.status,
                                name: machine.name,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        console.log(`  ✅ Created machine: ${machine.id} (${machine.name})`);
                }

                // Seed products
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
                        console.log(`  ✅ Created product: ${product.name} (${product.machineId})`);
                }

                console.log('\n✅ Database seeded successfully!');
                console.log('\n📊 Summary:');
                console.log(`  - Machines: ${machines.length}`);
                console.log(`  - Products: ${products.length}`);
                console.log('\n💡 You can now scan QR codes for:');
                machines.forEach(m => {
                        console.log(`  - ${m.id}: ${m.name}`);
                });

                process.exit(0);
        } catch (error) {
                console.error('\n❌ Error seeding database:', error);
                process.exit(1);
        }
}

// Run the seed
seedDatabase();
