"use strict";
/**
 * Firebase Admin Initialization
 *
 * Centralized Firebase Admin SDK initialization.
 * Import db and adminSDK from this file instead of index.ts to avoid circular dependencies.
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
exports.adminSDK = exports.Timestamp = exports.FieldValue = exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("@google-cloud/firestore");
Object.defineProperty(exports, "Timestamp", { enumerable: true, get: function () { return firestore_1.Timestamp; } });
// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
    admin.initializeApp();
}
// Export Firestore instance
exports.db = admin.firestore();
// Export FieldValue for timestamp and increment operations
exports.FieldValue = firestore_1.FieldValue;
// Export Admin SDK for timestamp operations, etc.
exports.adminSDK = admin;
//# sourceMappingURL=firebase.js.map