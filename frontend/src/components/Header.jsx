/**
 * Header Component
 *
 * Glassmorphism sticky header with machine info and live status.
 */

import React from 'react';
import { MapPin, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const Header = ({ machine, isOnline, loading }) => {
        return (
                <header className="sticky top-0 z-40">
                        <div className="bg-white/60 backdrop-blur-2xl border-b border-white/40"
                                style={{ boxShadow: '0 4px 30px rgba(0, 0, 0, 0.04)' }}>
                                <div className="max-w-7xl mx-auto px-5 py-4">
                                        <div className="flex items-center justify-between">
                                                {/* Logo & Title */}
                                                <div className="flex items-center gap-3.5">
                                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                                                style={{
                                                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                                        boxShadow: '0 4px 16px rgba(99,102,241,0.35), inset 0 1px 1px rgba(255,255,255,0.2)',
                                                                }}>
                                                                <span className="text-white text-xl">🛒</span>
                                                        </div>
                                                        <div>
                                                                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                                                                        Smart Vending
                                                                </h1>
                                                                {machine && (
                                                                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                                                                                <MapPin className="w-3 h-3 text-primary-400" />
                                                                                <span className="truncate max-w-[200px] md:max-w-none">
                                                                                        {machine.location}
                                                                                </span>
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>

                                                {/* Status Indicator */}
                                                <div className="flex items-center">
                                                        {loading ? (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur border border-white/50">
                                                                        <RefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                                                                        <span className="text-xs font-medium text-gray-500 hidden sm:inline">Loading...</span>
                                                                </div>
                                                        ) : isOnline ? (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                                                        style={{
                                                                                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(52,211,153,0.05))',
                                                                                border: '1px solid rgba(16,185,129,0.2)',
                                                                        }}>
                                                                        <span className="relative flex h-2 w-2">
                                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                                                        </span>
                                                                        <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                                                                        <span className="text-xs font-semibold text-emerald-700 hidden sm:inline">Online</span>
                                                                </div>
                                                        ) : (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                                                        style={{
                                                                                background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(248,113,113,0.05))',
                                                                                border: '1px solid rgba(239,68,68,0.15)',
                                                                        }}>
                                                                        <span className="relative flex h-2 w-2">
                                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                                                        </span>
                                                                        <WifiOff className="w-3.5 h-3.5 text-red-500" />
                                                                        <span className="text-xs font-semibold text-red-600 hidden sm:inline">Offline</span>
                                                                </div>
                                                        )}
                                                </div>
                                        </div>

                                        {!loading && !isOnline && (
                                                <div className="mt-3 rounded-xl p-3 bg-red-50/60 backdrop-blur border border-red-200/40">
                                                        <p className="text-red-600 text-sm text-center font-medium">
                                                                ⚠️ This machine is currently offline. Purchases are temporarily unavailable.
                                                        </p>
                                                </div>
                                        )}
                                </div>
                        </div>
                </header>
        );
};

export default Header;
