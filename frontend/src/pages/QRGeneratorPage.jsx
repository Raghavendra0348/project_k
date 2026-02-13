/**
 * QR Code Generator Page
 * 
 * Admin tool to generate QR codes for vending machines.
 * Generate and download QR codes for physical placement on machines.
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const QRGeneratorPage = () => {
        const [machineId, setMachineId] = useState('machine-001');
        const [qrDataUrl, setQrDataUrl] = useState('');
        const [copied, setCopied] = useState(false);
        const canvasRef = useRef(null);

        // Generate QR code whenever machineId changes
        useEffect(() => {
                generateQRCode();
        }, [machineId]);

        const generateQRCode = async () => {
                try {
                        // Generate QR code with machine ID
                        // Format: MACHINE:machine-id (simple format for easy parsing)
                        const qrData = `MACHINE:${machineId}`;

                        // Generate QR code as data URL
                        const url = await QRCode.toDataURL(qrData, {
                                width: 400,
                                margin: 2,
                                color: {
                                        dark: '#000000',
                                        light: '#FFFFFF'
                                }
                        });

                        setQrDataUrl(url);
                } catch (error) {
                        console.error('Error generating QR code:', error);
                        toast.error('Failed to generate QR code');
                }
        };

        const downloadQRCode = () => {
                const link = document.createElement('a');
                link.download = `vending-machine-${machineId}.png`;
                link.href = qrDataUrl;
                link.click();
                toast.success('QR code downloaded!');
        };

        const copyMachineId = () => {
                navigator.clipboard.writeText(machineId);
                setCopied(true);
                toast.success('Machine ID copied!');
                setTimeout(() => setCopied(false), 2000);
        };

        const predefinedMachines = [
                { id: 'machine-001', name: 'Building A Lobby' },
                { id: 'machine-002', name: 'Building B Cafeteria' },
                { id: 'machine-003', name: 'Building C Entrance' },
                { id: 'test-machine-001', name: 'Test Machine (Dev)' },
        ];

        return (
                <div className="min-h-screen bg-gray-50 py-12 px-4">
                        <div className="max-w-4xl mx-auto">
                                <div className="bg-white rounded-2xl shadow-lg p-8">
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                                QR Code Generator
                                        </h1>
                                        <p className="text-gray-600 mb-8">
                                                Generate QR codes for your vending machines
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-8">
                                                {/* Left Side - Input */}
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Machine ID
                                                        </label>
                                                        <div className="flex gap-2 mb-4">
                                                                <input
                                                                        type="text"
                                                                        value={machineId}
                                                                        onChange={(e) => setMachineId(e.target.value)}
                                                                        placeholder="Enter machine ID"
                                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                                <button
                                                                        onClick={copyMachineId}
                                                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                                        title="Copy machine ID"
                                                                >
                                                                        {copied ? (
                                                                                <Check className="w-5 h-5 text-green-600" />
                                                                        ) : (
                                                                                <Copy className="w-5 h-5 text-gray-600" />
                                                                        )}
                                                                </button>
                                                        </div>

                                                        {/* Predefined machines */}
                                                        <div className="mb-6">
                                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                                        Quick Select:
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                        {predefinedMachines.map((machine) => (
                                                                                <button
                                                                                        key={machine.id}
                                                                                        onClick={() => setMachineId(machine.id)}
                                                                                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${machineId === machine.id
                                                                                                        ? 'bg-blue-600 text-white'
                                                                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                                                                }`}
                                                                                >
                                                                                        {machine.name}
                                                                                </button>
                                                                        ))}
                                                                </div>
                                                        </div>

                                                        {/* Instructions */}
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                                <h3 className="font-semibold text-blue-900 mb-2">
                                                                        📱 How to use:
                                                                </h3>
                                                                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                                                        <li>Enter your machine ID</li>
                                                                        <li>Download the QR code</li>
                                                                        <li>Print and place on vending machine</li>
                                                                        <li>Users scan to access the machine</li>
                                                                </ol>
                                                        </div>
                                                </div>

                                                {/* Right Side - QR Code */}
                                                <div className="flex flex-col items-center justify-center">
                                                        {qrDataUrl && (
                                                                <>
                                                                        <div className="bg-white p-6 rounded-xl shadow-md mb-4">
                                                                                <img
                                                                                        src={qrDataUrl}
                                                                                        alt={`QR Code for ${machineId}`}
                                                                                        className="w-64 h-64"
                                                                                />
                                                                        </div>
                                                                        <div className="text-center mb-4">
                                                                                <p className="text-sm text-gray-600">Machine ID:</p>
                                                                                <p className="font-mono font-semibold text-gray-900">
                                                                                        {machineId}
                                                                                </p>
                                                                        </div>
                                                                        <button
                                                                                onClick={downloadQRCode}
                                                                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                                                                        >
                                                                                <Download className="w-5 h-5" />
                                                                                Download QR Code
                                                                        </button>
                                                                </>
                                                        )}
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default QRGeneratorPage;
