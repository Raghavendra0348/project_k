/**
 * Home Page
 * 
 * Landing page with QR scanner for vending machine access.
 * Users scan QR codes to access specific vending machines.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, ShoppingCart, CreditCard, Zap, Camera, X } from 'lucide-react';
import { QrReader } from 'react-qr-reader';
import toast from 'react-hot-toast';

const HomePage = () => {
        const navigate = useNavigate();
        const [showScanner, setShowScanner] = useState(false);
        const [scanning, setScanning] = useState(false);

        // Test machines for development
        const testMachines = [
                { id: 'machine-001', name: 'Building A Lobby' },
                { id: 'machine-002', name: 'Building B Cafeteria' },
                { id: 'test-machine-001', name: 'Test Machine (Dev)' },
        ];

        // Handle QR code scan
        const handleScan = (result) => {
                if (result && !scanning) {
                        setScanning(true);
                        const scannedText = result?.text || result;

                        // Extract machine ID from QR code
                        // Expected formats:
                        // 1. Direct machine ID: "machine-001"
                        // 2. Full URL: "https://yourapp.com/machine/machine-001"
                        // 3. Machine ID with prefix: "MACHINE:machine-001"

                        let machineId = null;

                        if (scannedText.includes('/machine/')) {
                                // Extract from URL
                                const matches = scannedText.match(/\/machine\/([^/?#]+)/);
                                machineId = matches ? matches[1] : null;
                        } else if (scannedText.startsWith('MACHINE:')) {
                                // Extract from prefix format
                                machineId = scannedText.replace('MACHINE:', '');
                        } else if (scannedText.match(/^[a-zA-Z0-9-]+$/)) {
                                // Direct machine ID
                                machineId = scannedText;
                        }

                        if (machineId) {
                                toast.success(`Machine detected: ${machineId}`);
                                setShowScanner(false);
                                navigate(`/machine/${machineId}`);
                        } else {
                                toast.error('Invalid QR code. Please scan a vending machine QR code.');
                                setScanning(false);
                        }
                }
        };

        // Handle scan error
        const handleError = (error) => {
                console.error('QR Scanner Error:', error);
                if (error?.name === 'NotAllowedError') {
                        toast.error('Camera permission denied. Please enable camera access.');
                } else if (error?.name === 'NotFoundError') {
                        toast.error('No camera found on this device.');
                } else {
                        toast.error('Error accessing camera. Please try again.');
                }
        };

        return (
                <div className="page-container min-h-screen">
                        {/* QR Scanner Modal */}
                        {showScanner && (
                                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                                        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
                                                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-between">
                                                        <h3 className="font-semibold text-lg">Scan QR Code</h3>
                                                        <button
                                                                onClick={() => {
                                                                        setShowScanner(false);
                                                                        setScanning(false);
                                                                }}
                                                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                                        >
                                                                <X className="w-6 h-6" />
                                                        </button>
                                                </div>
                                                <div className="relative aspect-square">
                                                        <QrReader
                                                                constraints={{ facingMode: 'environment' }}
                                                                onResult={handleScan}
                                                                onError={handleError}
                                                                className="w-full"
                                                        />
                                                </div>
                                                <div className="p-4 text-center text-sm text-gray-600">
                                                        Position the QR code within the frame
                                                </div>
                                        </div>
                                </div>
                        )}

                        {/* Hero Section */}
                        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                                {/* Logo */}
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <span className="text-4xl">🛒</span>
                                </div>

                                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                        Smart Vending Machine
                                </h1>

                                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                        Scan the QR code on any vending machine to browse products,
                                        check stock in real-time, and pay securely with UPI or cards.
                                </p>

                                {/* Main CTA - Scan QR Code */}
                                <button
                                        onClick={() => setShowScanner(true)}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                >
                                        <Camera className="w-6 h-6" />
                                        Scan QR Code to Start
                                </button>

                                {/* How It Works */}
                                <div className="grid md:grid-cols-4 gap-6 my-12">
                                        <div className="bg-white rounded-xl p-6 shadow-md">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                        <QrCode className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <h3 className="font-semibold mb-2">1. Scan QR</h3>
                                                <p className="text-sm text-gray-600">
                                                        Scan the QR code on the vending machine
                                                </p>
                                        </div>

                                        <div className="bg-white rounded-xl p-6 shadow-md">
                                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                        <ShoppingCart className="w-6 h-6 text-green-600" />
                                                </div>
                                                <h3 className="font-semibold mb-2">2. Browse</h3>
                                                <p className="text-sm text-gray-600">
                                                        View products and real-time stock
                                                </p>
                                        </div>

                                        <div className="bg-white rounded-xl p-6 shadow-md">
                                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                        <CreditCard className="w-6 h-6 text-purple-600" />
                                                </div>
                                                <h3 className="font-semibold mb-2">3. Pay</h3>
                                                <p className="text-sm text-gray-600">
                                                        Pay securely via UPI or cards
                                                </p>
                                        </div>

                                        <div className="bg-white rounded-xl p-6 shadow-md">
                                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                                        <Zap className="w-6 h-6 text-orange-600" />
                                                </div>
                                                <h3 className="font-semibold mb-2">4. Collect</h3>
                                                <p className="text-sm text-gray-600">
                                                        Get your product instantly!
                                                </p>
                                        </div>
                                </div>

                                {/* Test Machines (Development Only) */}
                                {process.env.NODE_ENV === 'development' && (
                                        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                                                <h2 className="text-lg font-semibold text-yellow-800 mb-4">
                                                        🧪 Development Mode - Test Tools
                                                </h2>
                                                <div className="flex flex-wrap justify-center gap-3 mb-4">
                                                        {testMachines.map((machine) => (
                                                                <Link
                                                                        key={machine.id}
                                                                        to={`/machine/${machine.id}`}
                                                                        className="px-4 py-2 bg-white border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors text-sm"
                                                                >
                                                                        {machine.name}
                                                                </Link>
                                                        ))}
                                                </div>
                                                <Link
                                                        to="/admin/qr-generator"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                                                >
                                                        <QrCode className="w-4 h-4" />
                                                        Generate QR Codes
                                                </Link>
                                        </div>
                                )}

                                {/* Demo Links for All Environments */}
                                <div className="mt-8">
                                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                                Try Demo Machines
                                        </h2>
                                        <div className="flex flex-wrap justify-center gap-3">
                                                {testMachines.map((machine) => (
                                                        <Link
                                                                key={machine.id}
                                                                to={`/machine/${machine.id}`}
                                                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                                {machine.name}
                                                        </Link>
                                                ))}
                                        </div>
                                </div>
                        </div>

                        {/* Footer */}
                        <footer className="text-center py-8 text-gray-500 text-sm">
                                <p>Powered by Firebase & Razorpay</p>
                                <p className="mt-1">© 2024 Smart Vending Machine</p>
                        </footer>
                </div>
        );
};

export default HomePage;
