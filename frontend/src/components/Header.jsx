/**
 * Header Component
 * 
 * Displays machine information, location, and status.
 * Shows real-time connection status indicator.
 */

import React from 'react';
import { MapPin, Wifi, WifiOff, RefreshCw } from 'lucide-react';

/**
 * @param {Object} props
 * @param {Object} props.machine - Machine data
 * @param {boolean} props.isOnline - Machine online status
 * @param {boolean} [props.loading] - Whether data is loading
 */
const Header = ({ machine, isOnline, loading }) => {
        return (
                <header className="bg-white shadow-md sticky top-0 z-40">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                                <div className="flex items-center justify-between">
                                        {/* Logo & Title */}
                                        <div className="flex items-center gap-3">
                                                {/* Logo/Icon */}
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                                        <span className="text-white text-xl">🛒</span>
                                                </div>

                                                <div>
                                                        <h1 className="text-xl font-bold text-gray-900">
                                                                Smart Vending
                                                        </h1>

                                                        {/* Location */}
                                                        {machine && (
                                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                        <MapPin className="w-3 h-3" />
                                                                        <span className="truncate max-w-[200px] md:max-w-none">
                                                                                {machine.location}
                                                                        </span>
                                                                </div>
                                                        )}
                                                </div>
                                        </div>

                                        {/* Status Indicator */}
                                        <div className="flex items-center gap-2">
                                                {loading ? (
                                                        <div className="flex items-center gap-2 text-gray-500">
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                                <span className="text-sm hidden sm:inline">Loading...</span>
                                                        </div>
                                                ) : isOnline ? (
                                                        <div className="status-online">
                                                                <span className="relative flex h-3 w-3">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                                                </span>
                                                                <Wifi className="w-4 h-4" />
                                                                <span className="text-sm hidden sm:inline">Online</span>
                                                        </div>
                                                ) : (
                                                        <div className="status-offline">
                                                                <span className="relative flex h-3 w-3">
                                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                                                </span>
                                                                <WifiOff className="w-4 h-4" />
                                                                <span className="text-sm hidden sm:inline">Offline</span>
                                                        </div>
                                                )}
                                        </div>
                                </div>

                                {/* Offline Warning Banner */}
                                {!loading && !isOnline && (
                                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-red-700 text-sm text-center">
                                                        ⚠️ This machine is currently offline. Purchases are temporarily unavailable.
                                                </p>
                                        </div>
                                )}
                        </div>
                </header>
        );
};

export default Header;
