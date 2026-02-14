/**
 * 404 Not Found Page
 *
 * Glassmorphism 404 page with frosted glass card.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, QrCode } from 'lucide-react';

const NotFound = () => {
        return (
                <div className="mesh-gradient min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
                        {/* Background blobs */}
                        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full opacity-20 animate-blob"
                                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)' }} />
                        <div className="absolute bottom-20 -right-20 w-64 h-64 rounded-full opacity-20 animate-blob"
                                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)', animationDelay: '3s' }} />

                        <div className="glass-strong p-10 max-w-md w-full text-center animate-scale-in"
                                style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.08)' }}>
                                {/* 404 Illustration */}
                                <div className="relative mb-8">
                                        <div className="text-8xl font-extrabold bg-clip-text text-transparent"
                                                style={{ backgroundImage: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' }}>
                                                404
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="glass-icon w-20 h-20">
                                                        <span className="text-4xl">🤔</span>
                                                </div>
                                        </div>
                                </div>

                                <h1 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h1>
                                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                                        The page you're looking for doesn't exist or has been moved.
                                        If you scanned a QR code, please try scanning again.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Link to="/"
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
                                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                                                <Home className="w-4 h-4" />
                                                Go Home
                                        </Link>
                                        <button onClick={() => window.history.back()}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-gray-600 bg-white/50 backdrop-blur border border-white/60 hover:bg-white/70 transition-all">
                                                Go Back
                                        </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/40">
                                        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                                                <QrCode className="w-3.5 h-3.5" />
                                                <span>Scan a vending machine QR code to get started</span>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};

export default NotFound;
