/**
 * Add Trending and Sales Data to Production Database
 * 
 * This script updates existing products in production with:
 * - Trending information (badges, ranks, reasons)
 * - Sales data (weekly sales, trends, percentage changes)
 * 
 * Usage:
 * node functions/update-trending-data.js
 */

// Use production database (not emulator)
delete process.env.FIRESTORE_EMULATOR_HOST;

const admin = require('firebase-admin');

// Initialize with service account or default credentials
try {
        admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: 'vending-machine-web',
        });
} catch (e) {
        // Already initialized
}

const db = admin.firestore();

// Trending data for products
const trendingUpdates = {
        // Top trending products
        'prod-001-coke': { isTrending: true, rank: 1, reason: 'Top seller this season' },
        'prod-002-coke': { isTrending: true, rank: 1, reason: 'Top seller this season' },
        'prod-001-sprite': { isTrending: true, rank: 2, reason: 'Popular lime soda' },
        'prod-002-sprite': { isTrending: true, rank: 2, reason: 'Popular lime soda' },
        'prod-001-water': { isTrending: true, rank: 3, reason: 'Essential hydration - High demand' },
        'prod-002-water': { isTrending: true, rank: 3, reason: 'Essential hydration - High demand' },
        'prod-001-lays': { isTrending: true, rank: 4, reason: 'Snack time favorite' },
        'prod-001-kurkure': { isTrending: true, rank: 5, reason: 'Spicy snack trending' },
        'prod-002-kurkure': { isTrending: true, rank: 5, reason: 'Spicy snack trending' },
        'prod-001-pringles': { isTrending: true, rank: 6, reason: 'Premium chips' },
        'prod-001-dairymilk': { isTrending: true, rank: 7, reason: 'India\'s favorite chocolate' },
        'prod-003-dairymilk': { isTrending: true, rank: 7, reason: 'India\'s favorite chocolate' },
};

// Sales data for products
const salesUpdates = {
        'prod-001-coke': { lastWeek: 87, trend: 'up', percentChange: 15 },
        'prod-002-coke': { lastWeek: 92, trend: 'up', percentChange: 18 },
        'prod-001-sprite': { lastWeek: 38, trend: 'up', percentChange: 7 },
        'prod-002-sprite': { lastWeek: 42, trend: 'up', percentChange: 9 },
        'prod-001-frooti': { lastWeek: 35, trend: 'up', percentChange: 18 },
        'prod-001-water': { lastWeek: 42, trend: 'up', percentChange: 5 },
        'prod-002-water': { lastWeek: 48, trend: 'up', percentChange: 8 },
        'prod-001-lays': { lastWeek: 48, trend: 'up', percentChange: 10 },
        'prod-001-kurkure': { lastWeek: 54, trend: 'up', percentChange: 12 },
        'prod-002-kurkure': { lastWeek: 52, trend: 'up', percentChange: 11 },
        'prod-001-pringles': { lastWeek: 28, trend: 'up', percentChange: 15 },
        'prod-001-kitkat': { lastWeek: 35, trend: 'up', percentChange: 12 },
        'prod-001-dairymilk': { lastWeek: 52, trend: 'up', percentChange: 14 },
        'prod-001-snickers': { lastWeek: 31, trend: 'up', percentChange: 10 },
        'prod-001-redbull': { lastWeek: 25, trend: 'up', percentChange: 20 },
        'prod-002-redbull': { lastWeek: 22, trend: 'up', percentChange: 18 },
};

async function updateProductsWithTrendingData() {
        try {
                console.log('🌱 Starting to add trending and sales data to production...\n');

                const snapshot = await db.collection('products').get();
                let updated = 0;
                let skipped = 0;

                for (const doc of snapshot.docs) {
                        const productId = doc.id;
                        const product = doc.data();

                        const trending =
                                trendingUpdates[productId] || {
                                        isTrending: false,
                                        rank: 999,
                                        reason: '',
                                };

                        const salesData =
                                salesUpdates[productId] || {
                                        lastWeek: 0,
                                        trend: 'stable',
                                        percentChange: 0,
                                };

                        const updates = {
                                trending,
                                salesData,
                                updatedAt: new Date(),
                        };

                        await db.collection('products').doc(productId).update(updates);

                        if (trending.isTrending) {
                                console.log(`✅ Updated: ${product.name} (Trending #${trending.rank})`);
                        } else {
                                console.log(`✅ Updated: ${product.name} (No trending)`);
                        }
                        updated++;
                }

                console.log(`\n🎉 Success! Updated ${updated} products\n`);
                console.log('📊 Summary:');
                console.log(`   Total products updated: ${updated}`);
                console.log(`   Trending products: ${Object.keys(trendingUpdates).length}`);
                console.log(`   Products with sales data: ${Object.keys(salesUpdates).length}`);
                console.log('\n✨ Your deployed dashboard should now match local with:');
                console.log('   - Trending badges on products');
                console.log('   - Weekly sales numbers');
                console.log('   - Percentage change indicators');
                console.log('   - Proper trending rankings');

                return { success: true, updated };
        } catch (error) {
                console.error('❌ Error updating products:', error.message);
                throw error;
        }
}

// Run if this is the main module
if (require.main === module) {
        updateProductsWithTrendingData()
                .then(() => {
                        console.log('\n✅ Done!');
                        process.exit(0);
                })
                .catch((error) => {
                        console.error('❌ Failed:', error);
                        process.exit(1);
                });
}

module.exports = { updateProductsWithTrendingData };
