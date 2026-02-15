/**
 * Clean Duplicate Products Script
 * 
 * Removes duplicate products from Firestore
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanDuplicates() {
        console.log('🧹 Starting duplicate cleanup...\n');

        try {
                // Get all products
                const productsSnapshot = await db.collection('products').get();

                console.log(`📦 Found ${productsSnapshot.size} total products\n`);

                // Group products by name and machineId
                const productMap = new Map();
                const duplicates = [];

                productsSnapshot.forEach(doc => {
                        const data = doc.data();
                        const key = `${data.name}-${data.machineId}`;

                        if (productMap.has(key)) {
                                // This is a duplicate
                                duplicates.push({ id: doc.id, name: data.name, machineId: data.machineId });
                        } else {
                                // First occurrence
                                productMap.set(key, { id: doc.id, name: data.name });
                        }
                });

                if (duplicates.length === 0) {
                        console.log('✅ No duplicates found!');
                        process.exit(0);
                        return;
                }

                console.log(`⚠️  Found ${duplicates.length} duplicate products:\n`);
                duplicates.forEach(dup => {
                        console.log(`  - ${dup.name} (${dup.id}) in ${dup.machineId}`);
                });

                console.log('\n🗑️  Deleting duplicates...\n');

                // Delete duplicates
                const batch = db.batch();
                duplicates.forEach(dup => {
                        const docRef = db.collection('products').doc(dup.id);
                        batch.delete(docRef);
                });

                await batch.commit();

                console.log(`✅ Deleted ${duplicates.length} duplicate products!`);
                console.log(`📊 Remaining products: ${productMap.size}\n`);

        } catch (error) {
                console.error('❌ Error cleaning duplicates:', error);
                process.exit(1);
        }

        process.exit(0);
}

cleanDuplicates();
