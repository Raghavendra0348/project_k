/**
 * Add test dispense command to Firestore emulator
 * This creates a pending order for machine-001 to test ESP8266 integration
 */

const admin = require('firebase-admin');

// Connect to Firestore emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Initialize without credentials
admin.initializeApp({
        projectId: 'vending-machine-web',
});

const db = admin.firestore();

async function addTestDispense() {
        try {
                console.log('Adding test dispense command...\n');

                const testDispense = {
                        machineId: 'machine-001',
                        orderId: 'order-test-' + Date.now(),
                        productId: 'prod-001-coke',
                        status: 'pending',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                };

                const docRef = await db.collection('dispenseQueue').add(testDispense);
                
                console.log('✅ Test dispense command created!');
                console.log(`   Document ID: ${docRef.id}`);
                console.log(`   Machine ID: ${testDispense.machineId}`);
                console.log(`   Product ID: ${testDispense.productId}`);
                console.log(`   Status: ${testDispense.status}`);
                console.log('\n💡 The ESP8266 should now pick this up on next poll (in ~3 seconds)');

                process.exit(0);
        } catch (error) {
                console.error('❌ Error:', error);
                process.exit(1);
        }
}

addTestDispense();
