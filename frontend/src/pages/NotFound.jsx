/**
 * 404 Not Found Page
 * 
 * Displayed when user navigates to a non-existent route.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, QrCode } from 'lucide-react';

const NotFound = () => {
        return (
                <div className="page-container min-h-screen flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                                {/* 404 Illustration */}
                                <div className="relative mb-8">
                                        <div className="text-9xl font-bold text-gray-200">404</div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-4xl">🤔</span>
                                                </div>
                                        </div>
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                        Page Not Found
                                </h1>

                                <p className="text-gray-600 mb-8">
                                        The page you're looking for doesn't exist or has been moved.
                                        If you scanned a QR code, please try scanning again.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Link
                                                to="/"
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                                <Home className="w-5 h-5" />
                                                Go Home
                                        </Link>

                                        <button
                                                onClick={() => window.history.back()}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                                Go Back
                                        </button>
                                </div>

                                {/* QR Code Hint */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                                <QrCode className="w-4 h-4" />
                                                <span>Scan a vending machine QR code to get started</span>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default NotFound;
