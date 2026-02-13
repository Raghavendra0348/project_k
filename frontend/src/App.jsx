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

function App() {
        return (
                <Router>
                        {/* Global Toast Notifications */}
                        <Toaster
                                position="top-center"
                                toastOptions={{
                                        // Default options for all toasts
                                        duration: 4000,
                                        style: {
                                                background: '#333',
                                                color: '#fff',
                                                borderRadius: '10px',
                                                padding: '16px',
                                        },
                                        // Specific options by type
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

                                {/* 404 Not Found */}
                                <Route path="/not-found" element={<NotFound />} />

                                {/* Catch all - redirect to not found */}
                                <Route path="*" element={<Navigate to="/not-found" replace />} />
                        </Routes>
                </Router>
        );
}

export default App;
