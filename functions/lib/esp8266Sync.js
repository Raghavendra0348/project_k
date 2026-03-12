"use strict";
/**
 * ESP8266 Dispense Sync — Firestore Only
 *
 * These Cloud Functions handle dispense queue management using Firestore.
 * The ESP8266 polls Firestore via its REST API, so no Realtime Database is needed.
 *
 * Exports:
 *   syncDispenseToRTDB        – (kept name for backward compat) logs new dispense docs
 *   syncDispenseUpdateToRTDB  – cleans up completed/failed entries after 60 s
 *   esp8266ConfirmDispense    – HTTP endpoint for ESP8266 to confirm dispensing
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.esp8266ConfirmDispense = exports.syncDispenseUpdateToRTDB = exports.syncDispenseToRTDB = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("./firebase");
// ============================================
// ON-CREATE: Log new dispense commands
// ============================================
exports.syncDispenseToRTDB = functions.firestore
    .document('dispenseQueue/{dispenseId}')
    .onCreate(async (snap, context) => {
    const dispenseId = context.params.dispenseId;
    const data = snap.data();
    functions.logger.info('New dispense command created (Firestore)', {
        dispenseId,
        machineId: data.machineId,
        productId: data.productId,
    });
});
// ============================================
// ON-UPDATE: Clean up completed / failed entries
// ============================================
exports.syncDispenseUpdateToRTDB = functions.firestore
    .document('dispenseQueue/{dispenseId}')
    .onUpdate(async (change, context) => {
    const dispenseId = context.params.dispenseId;
    const newData = change.after.data();
    functions.logger.info('Dispense status updated', {
        dispenseId,
        status: newData.status,
    });
    // Auto-delete completed/failed entries after 60 seconds
    if (newData.status === 'completed' || newData.status === 'failed') {
        setTimeout(async () => {
            try {
                await firebase_1.db.collection('dispenseQueue').doc(dispenseId).delete();
                functions.logger.info('Cleaned up dispense entry', { dispenseId });
            }
            catch (e) {
                // Ignore cleanup errors
            }
        }, 60000);
    }
});
// ============================================
// HTTP: ESP8266 confirms dispense completion
// ============================================
exports.esp8266ConfirmDispense = functions.https.onRequest(async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: 'Method not allowed' });
        return;
    }
    const { dispenseId, machineId, status, errorCode } = req.body;
    if (!dispenseId || !machineId || !status) {
        res.status(400).json({
            success: false,
            error: 'Missing required fields: dispenseId, machineId, status',
        });
        return;
    }
    try {
        const dispenseRef = firebase_1.db.collection('dispenseQueue').doc(dispenseId);
        const dispenseDoc = await dispenseRef.get();
        if (!dispenseDoc.exists) {
            res.status(404).json({ success: false, error: 'Dispense record not found' });
            return;
        }
        const dispenseData = dispenseDoc.data();
        if (dispenseData.machineId !== machineId) {
            res.status(400).json({ success: false, error: 'Machine ID mismatch' });
            return;
        }
        // Update dispense queue entry
        await dispenseRef.update({
            status: status === 'success' ? 'completed' : 'failed',
            confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            errorCode: errorCode || null,
        });
        // Mark order as dispensed on success
        if (status === 'success') {
            await firebase_1.db.collection('orders').doc(dispenseData.orderId).update({
                dispensed: true,
                dispensedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        functions.logger.info('ESP8266 dispense confirmation received', {
            dispenseId,
            machineId,
            status,
        });
        res.status(200).json({ success: true, message: 'Dispense confirmation recorded' });
    }
    catch (error) {
        functions.logger.error('Error processing ESP8266 confirmation:', error);
        res.status(500).json({ success: false, error: 'Failed to process confirmation' });
    }
});
//# sourceMappingURL=esp8266Sync.js.map