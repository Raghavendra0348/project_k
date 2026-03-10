/**
 * Main App Component
 * 
 * Sets up routing and global providers for the application.
 * Routes:
 * - /machine/:machineId - Main vending machine product page
 * - / - Home redirect
 * - * - 404 Not Found
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import MachinePage from './pages/MachinePage';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';
import QRGeneratorPage from './pages/QRGeneratorPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
        return (
                <Router>
                        {/* Global Toast Notifications */}
                        <Toaster
                                position="top-center"
                                toastOptions={{
                                        duration: 4000,
                                        style: {
                                                background: 'rgba(255, 255, 255, 0.85)',
                                                backdropFilter: 'blur(20px)',
                                                WebkitBackdropFilter: 'blur(20px)',
                                                color: '#1f2937',
                                                borderRadius: '16px',
                                                padding: '14px 18px',
                                                border: '1px solid rgba(255, 255, 255, 0.6)',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255,255,255,0.6)',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                        },
                                        success: {
                                                iconTheme: {
                                                        primary: '#10b981',
                                                        secondary: '#fff',
                                                },
                                        },
                                        error: {
                                                iconTheme: {
                                                        primary: '#ef4444',
                                                        secondary: '#fff',
                                                },
                                        },
                                }}
                        />

                        {/* Application Routes */}
                        <Routes>
                                {/* Home Page */}
                                <Route path="/" element={<HomePage />} />

                                {/* Main vending machine page - accessed via QR code */}
                                <Route path="/machine/:machineId" element={<MachinePage />} />

                                {/* QR Code Generator (Admin Tool) */}
                                <Route path="/admin/qr-generator" element={<QRGeneratorPage />} />

                                {/* Admin Dashboard - Stock Alerts & Product Management */}
                                <Route path="/admin" element={<AdminDashboard />} />

                                {/* 404 Not Found */}
                                <Route path="/not-found" element={<NotFound />} />

                                {/* Catch all - redirect to not found */}
                                <Route path="*" element={<Navigate to="/not-found" replace />} />
                        </Routes>
                </Router>
        );
}

export default App;
