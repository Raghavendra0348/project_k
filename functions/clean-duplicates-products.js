/**
 * Script to clean duplicate products from Firestore
 * Run from functions directory: node clean-duplicates-products.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
        admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
        });
}

const db = admin.firestore();

async function cleanDuplicateProducts() {
        try {
                console.log('Starting duplicate product cleanup...\n');

                const snapshot = await db.collection('products').get();

                if (snapshot.empty) {
                        console.log('No products found.');
                        return;
                }

                console.log(`Total products found: ${snapshot.size}\n`);

                // Group products by name and machineId
                const productMap = {};
                const duplicates = [];

                snapshot.forEach((doc) => {
                        const product = doc.data();
                        const key = `${product.name}_${product.machineId}`;

                        if (!productMap[key]) {
                                productMap[key] = [];
                        }

                        productMap[key].push({
                                id: doc.id,
                                ...product,
                        });
                });

                // Find duplicates
                for (const [key, products] of Object.entries(productMap)) {
                        if (products.length > 1) {
                                console.log(`Found ${products.length} duplicates for: ${key}`);
                                products.forEach((p, idx) => {
                                        console.log(`  ${idx + 1}. ID: ${p.id}, Stock: ${p.stock}, Created: ${p.createdAt}`);
                                });

                                // Keep the first one, mark others for deletion
                                duplicates.push(...products.slice(1));
                                console.log('');
                        }
                }

                if (duplicates.length === 0) {
                        console.log('✓ No duplicate products found!');
                        return;
                }

                console.log(`\n⚠️  Found ${duplicates.length} duplicate products to delete.\n`);

                // Delete duplicates
                let deleted = 0;
                for (const product of duplicates) {
                        await db.collection('products').doc(product.id).delete();
                        deleted++;
                        console.log(`Deleted: ${product.name} (${product.id})`);
                }

                console.log(`\n✓ Successfully deleted ${deleted} duplicate products!`);

        } catch (error) {
                console.error('Error cleaning duplicates:', error);
                process.exit(1);
        } finally {
                await admin.app().delete();
        }
}

cleanDuplicateProducts();
