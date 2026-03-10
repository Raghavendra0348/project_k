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

// Helper to get current season (for India)
const getCurrentSeason = () => {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'summer';
        if (month >= 6 && month <= 9) return 'monsoon';
        if (month >= 10 && month <= 11) return 'autumn';
        return 'winter';
};

// Trending tags based on season
const seasonalTrends = {
        summer: ['cold beverages', 'water', 'ice cream', 'energy drinks', 'lemon drinks'],
        monsoon: ['hot snacks', 'tea', 'coffee', 'maggi', 'pakora'],
        autumn: ['chocolates', 'sweets', 'festive snacks'],
        winter: ['hot beverages', 'chocolates', 'cookies', 'warm snacks'],
};

const currentSeason = getCurrentSeason();

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
                name: 'Coca Cola 500ml',
                price: 40,
                stock: 25,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                description: 'Refreshing cola drink',
                trending: { isTrending: true, rank: 1, reason: 'Top seller this season' },
                salesData: { lastWeek: 87, lastMonth: 342, trend: 'up', percentChange: 15 },
                seasonalTag: 'summer',
        },
        {
                id: 'prod-001-pepsi',
                machineId: 'machine-001',
                name: 'Pepsi 500ml',
                price: 40,
                stock: 20,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
                description: 'Classic Pepsi',
                trending: { isTrending: true, rank: 3, reason: 'Popular choice' },
                salesData: { lastWeek: 65, lastMonth: 280, trend: 'up', percentChange: 8 },
                seasonalTag: 'summer',
        },
        {
                id: 'prod-001-water',
                machineId: 'machine-001',
                name: 'Bisleri Water 500ml',
                price: 20,
                stock: 50,
                category: 'water',
                imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400',
                description: 'Pure mineral water',
                trending: { isTrending: true, rank: 2, reason: 'Essential hydration - High demand' },
                salesData: { lastWeek: 156, lastMonth: 620, trend: 'up', percentChange: 25 },
                seasonalTag: 'summer',
        },
        {
                id: 'prod-001-water-1l',
                machineId: 'machine-001',
                name: 'Mineral Water 1L',
                price: 25,
                stock: 1,
                category: 'water',
                imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
                description: 'Large mineral water bottle',
                trending: { isTrending: false, rank: 8, reason: '' },
                salesData: { lastWeek: 23, lastMonth: 95, trend: 'stable', percentChange: 2 },
                seasonalTag: 'summer',
        },
        {
                id: 'prod-001-lays',
                machineId: 'machine-001',
                name: 'Lays Classic Chips',
                price: 20,
                stock: 30,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
                description: 'Crispy potato chips',
                trending: { isTrending: true, rank: 4, reason: 'Snack time favorite' },
                salesData: { lastWeek: 54, lastMonth: 210, trend: 'up', percentChange: 12 },
                seasonalTag: 'all-season',
        },
        {
                id: 'prod-001-kurkure',
                machineId: 'machine-001',
                name: 'Kurkure Masala Munch',
                price: 20,
                stock: 25,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1613919228350-e0447a7b7f4c?w=400',
                description: 'Crunchy spicy snack',
                trending: { isTrending: true, rank: 5, reason: 'Spicy snack trending' },
                salesData: { lastWeek: 48, lastMonth: 185, trend: 'up', percentChange: 10 },
                seasonalTag: 'monsoon',
        },
        {
                id: 'prod-001-pringles',
                machineId: 'machine-001',
                name: 'Pringles Original',
                price: 60,
                stock: 12,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400',
                description: 'Stackable chips',
                trending: { isTrending: false, rank: 10, reason: '' },
                salesData: { lastWeek: 18, lastMonth: 72, trend: 'stable', percentChange: 0 },
                seasonalTag: 'all-season',
        },
        {
                id: 'prod-001-kitkat',
                machineId: 'machine-001',
                name: 'KitKat Chocolate',
                price: 30,
                stock: 28,
                category: 'chocolates',
                imageUrl: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400',
                description: 'Crispy wafer chocolate',
                trending: { isTrending: true, rank: 6, reason: 'Break time bestseller' },
                salesData: { lastWeek: 42, lastMonth: 168, trend: 'up', percentChange: 5 },
                seasonalTag: 'winter',
        },
        {
                id: 'prod-001-dairymilk',
                machineId: 'machine-001',
                name: 'Cadbury Dairy Milk',
                price: 50,
                stock: 22,
                category: 'chocolates',
                imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400',
                description: 'Classic milk chocolate',
                trending: { isTrending: true, rank: 7, reason: 'India\'s favorite chocolate' },
                salesData: { lastWeek: 38, lastMonth: 152, trend: 'up', percentChange: 7 },
                seasonalTag: 'winter',
        },
        {
                id: 'prod-001-snickers',
                machineId: 'machine-001',
                name: 'Snickers Bar',
                price: 35,
                stock: 18,
                category: 'chocolates',
                imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
                description: 'Chocolate with peanuts',
                trending: { isTrending: false, rank: 11, reason: '' },
                salesData: { lastWeek: 22, lastMonth: 88, trend: 'down', percentChange: -3 },
                seasonalTag: 'winter',
        },
        {
                id: 'prod-001-frooti',
                machineId: 'machine-001',
                name: 'Frooti Mango Drink',
                price: 30,
                stock: 24,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
                description: 'Fresh mango drink',
                trending: { isTrending: true, rank: 9, reason: 'Summer mango season' },
                salesData: { lastWeek: 35, lastMonth: 140, trend: 'up', percentChange: 18 },
                seasonalTag: 'summer',
        },

        // Machine 002 products
        {
                id: 'prod-002-coke',
                machineId: 'machine-002',
                name: 'Coca Cola 500ml',
                price: 40,
                stock: 30,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
                description: 'Refreshing cola drink',
                trending: { isTrending: true, rank: 1, reason: 'Cafeteria bestseller' },
                salesData: { lastWeek: 120, lastMonth: 480, trend: 'up', percentChange: 20 },
                seasonalTag: 'summer',
        },
        {
                id: 'prod-002-sprite',
                machineId: 'machine-002',
                name: 'Sprite 500ml',
                price: 40,
                stock: 25,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
                description: 'Lemon lime soda',
                trending: { isTrending: true, rank: 4, reason: 'Refreshing choice' },
                salesData: { lastWeek: 55, lastMonth: 220, trend: 'up', percentChange: 10 },
                seasonalTag: 'summer',
        },
        {
                id: 'prod-002-redbull',
                machineId: 'machine-002',
                name: 'Red Bull Energy Drink',
                price: 125,
                stock: 15,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1613313254538-e0e7a32d568c?w=400',
                description: 'Energy drink',
                trending: { isTrending: true, rank: 2, reason: 'Work hours energy boost' },
                salesData: { lastWeek: 78, lastMonth: 312, trend: 'up', percentChange: 22 },
                seasonalTag: 'all-season',
        },
        {
                id: 'prod-002-monster',
                machineId: 'machine-002',
                name: 'Monster Energy',
                price: 130,
                stock: 10,
                category: 'beverages',
                imageUrl: 'https://images.unsplash.com/photo-1622543925917-763c34f5a006?w=400',
                description: 'Monster energy drink',
                trending: { isTrending: true, rank: 3, reason: 'Gamer favorite' },
                salesData: { lastWeek: 62, lastMonth: 248, trend: 'up', percentChange: 15 },
                seasonalTag: 'all-season',
        },
        {
                id: 'prod-002-water',
                machineId: 'machine-002',
                name: 'Aquafina Water 1L',
                price: 25,
                stock: 40,
                category: 'water',
                imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
                description: 'Purified water',
                trending: { isTrending: false, rank: 6, reason: '' },
                salesData: { lastWeek: 95, lastMonth: 380, trend: 'stable', percentChange: 3 },
                seasonalTag: 'summer',
        },
        {
                id: 'prod-002-oreo',
                machineId: 'machine-002',
                name: 'Oreo Cookies',
                price: 35,
                stock: 20,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400',
                description: 'Chocolate sandwich cookies',
                trending: { isTrending: true, rank: 5, reason: 'Tea time essential' },
                salesData: { lastWeek: 45, lastMonth: 180, trend: 'up', percentChange: 8 },
                seasonalTag: 'winter',
        },
        {
                id: 'prod-002-doritos',
                machineId: 'machine-002',
                name: 'Doritos Nacho Cheese',
                price: 55,
                stock: 16,
                category: 'snacks',
                imageUrl: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400',
                description: 'Cheesy tortilla chips',
                trending: { isTrending: false, rank: 9, reason: '' },
                salesData: { lastWeek: 28, lastMonth: 112, trend: 'stable', percentChange: 1 },
                seasonalTag: 'all-season',
        },
        {
                id: 'prod-002-mars',
                machineId: 'machine-002',
                name: 'Mars Bar',
                price: 38,
                stock: 14,
                category: 'chocolates',
                imageUrl: 'https://images.unsplash.com/photo-1595495055755-1117d0572a87?w=400',
                description: 'Chocolate caramel bar',
                trending: { isTrending: false, rank: 8, reason: '' },
                salesData: { lastWeek: 18, lastMonth: 72, trend: 'down', percentChange: -5 },
                seasonalTag: 'winter',
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
                trending: { isTrending: true, rank: 7, reason: 'Monsoon comfort food' },
                salesData: { lastWeek: 52, lastMonth: 208, trend: 'up', percentChange: 30 },
                seasonalTag: 'monsoon',
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
                trending: { isTrending: false, rank: 1, reason: '' },
                salesData: { lastWeek: 5, lastMonth: 20, trend: 'stable', percentChange: 0 },
                seasonalTag: 'all-season',
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
                trending: { isTrending: false, rank: 2, reason: '' },
                salesData: { lastWeek: 3, lastMonth: 12, trend: 'stable', percentChange: 0 },
                seasonalTag: 'all-season',
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
                                trending: product.trending,
                                salesData: product.salesData,
                                seasonalTag: product.seasonalTag,
                                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        const trendIcon = product.trending.isTrending ? '🔥' : '  ';
                        console.log(`  ✅ ${trendIcon} Created product: ${product.name} (${product.machineId})`);
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
