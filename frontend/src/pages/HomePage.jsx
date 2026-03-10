/**
 * Home Page
 *
 * Premium landing page inspired by modern fintech apps.
 * Features a hero QR scanner card with green corner brackets,
 * torch toggle, animated text, and glassmorphism cards.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
        QrCode, ShoppingCart, CreditCard, Zap,
        Camera, X, Sparkles, ChevronRight, Shield,
        Clock, Flashlight, FlashlightOff, Image as ImageIcon,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';

const HomePage = () => {
        const navigate = useNavigate();
        const [showScanner, setShowScanner] = useState(false);
        const [torchOn, setTorchOn] = useState(false);
        const scanProcessedRef = useRef(false);
        const videoTrackRef = useRef(null);
        const stepsRef = useRef(null);
        const [stepsVisible, setStepsVisible] = useState(false);
        const html5QrCodeRef = useRef(null);
        const scannerIdRef = useRef('qr-reader-' + Math.random().toString(36).substr(2, 9));

        // Animated text typing effect
        const taglines = useMemo(() => [
                'Scan. Pay. Collect. It\'s that simple.',
                'Contactless vending, powered by QR.',
                'Real-time stock. Instant checkout.',
                'Your smart vending companion.',
        ], []);
        const [taglineIndex, setTaglineIndex] = useState(0);
        const [displayed, setDisplayed] = useState('');
        const [isDeleting, setIsDeleting] = useState(false);

        useEffect(() => {
                const current = taglines[taglineIndex];
                let timeout;

                if (!isDeleting && displayed.length < current.length) {
                        timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 50);
                } else if (!isDeleting && displayed.length === current.length) {
                        timeout = setTimeout(() => setIsDeleting(true), 2200);
                } else if (isDeleting && displayed.length > 0) {
                        timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length - 1)), 30);
                } else if (isDeleting && displayed.length === 0) {
                        setIsDeleting(false);
                        setTaglineIndex((prev) => (prev + 1) % taglines.length);
                }

                return () => clearTimeout(timeout);
        }, [displayed, isDeleting, taglineIndex, taglines]);

        // Intersection Observer for steps cards animation
        useEffect(() => {
                const stepsNode = stepsRef.current;
                if (!stepsNode) return;

                const observer = new IntersectionObserver(
                        (entries) => {
                                entries.forEach((entry) => {
                                        if (entry.isIntersecting && !stepsVisible) {
                                                setStepsVisible(true);
                                        }
                                });
                        },
                        { threshold: 0.1 }
                );

                observer.observe(stepsNode);

                return () => {
                        if (stepsNode) {
                                observer.unobserve(stepsNode);
                        }
                };
        }, [stepsVisible]);

        // Move handleScan and handleError above this effect
        // Initialize and cleanup html5-qrcode scanner
        useEffect(() => {
                if (!showScanner) return;

                const scannerId = scannerIdRef.current;

                const startScanner = async () => {
                        try {
                                html5QrCodeRef.current = new Html5Qrcode(scannerId);

                                await html5QrCodeRef.current.start(
                                        { facingMode: "environment" },
                                        {
                                                fps: 10,
                                                qrbox: { width: 250, height: 250 }
                                        },
                                        (decodedText) => {
                                                if (!scanProcessedRef.current) {
                                                        handleScan({ text: decodedText });
                                                }
                                        },
                                        (errorMessage) => {
                                                // Ignore common scanning messages
                                        }
                                );

                                // Get video track for torch control
                                const stream = html5QrCodeRef.current.getRunningTrackCameraCapabilities();
                                if (stream) {
                                        videoTrackRef.current = stream;
                                }
                        } catch (err) {
                                console.error('Scanner start error:', err);
                                handleError(err);
                        }
                };

                startScanner();

                return () => {
                        if (html5QrCodeRef.current) {
                                html5QrCodeRef.current.stop().catch(err => console.error('Scanner stop error:', err));
                                html5QrCodeRef.current.clear();
                                html5QrCodeRef.current = null;
                        }
                        videoTrackRef.current = null;
                };
        }, [showScanner, handleScan, handleError]);

        // Torch toggle via MediaStream track
        const toggleTorch = useCallback(async () => {
                try {
                        if (!videoTrackRef.current) {
                                const stream = await navigator.mediaDevices.getUserMedia({
                                        video: { facingMode: 'environment' },
                                });
                                videoTrackRef.current = stream.getVideoTracks()[0];
                        }
                        const track = videoTrackRef.current;
                        const capabilities = track.getCapabilities?.();
                        if (capabilities?.torch) {
                                const next = !torchOn;
                                await track.applyConstraints({ advanced: [{ torch: next }] });
                                setTorchOn(next);
                        } else {
                                toast.error('Torch not available on this device');
                        }
                } catch {
                        toast.error('Could not toggle torch');
                }
        }, [torchOn]);

        const testMachines = [
                { id: 'machine-001', name: 'Building A Lobby', emoji: '🏢' },
                { id: 'machine-002', name: 'Building B Cafeteria', emoji: '🍽️' },
                { id: 'test-machine-001', name: 'Test Machine', emoji: '🧪' },
        ];

        const handleScan = useCallback((result) => {
                if (!result || scanProcessedRef.current) return;

                // Synchronous guard — prevents any further processing
                scanProcessedRef.current = true;

                const scannedText = result?.text || result;
                let machineId = null;

                if (scannedText.includes('/machine/')) {
                        const matches = scannedText.match(/\/machine\/([^/?#]+)/);
                        machineId = matches ? matches[1] : null;
                } else if (scannedText.startsWith('MACHINE:')) {
                        machineId = scannedText.replace('MACHINE:', '');
                } else if (scannedText.match(/^[a-zA-Z0-9-]+$/)) {
                        machineId = scannedText;
                }

                if (machineId) {
                        toast.success(`Machine detected: ${machineId}`);
                        setShowScanner(false);
                        navigate(`/machine/${machineId}`);
                } else {
                        toast.error('Invalid QR code. Please scan a vending machine QR code.');
                        // Allow retrying after a brief cooldown
                        setTimeout(() => { scanProcessedRef.current = false; }, 2000);
                }
        }, [navigate]);

        const handleImageUpload = async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                try {
                        const html5QrCode = new Html5Qrcode("qr-image-reader");
                        const result = await html5QrCode.scanFile(file, false);
                        handleScan({ text: result });
                } catch (error) {
                        console.error('QR code scanning error:', error);
                        toast.error('Could not read QR code from image. Please try again.');
                }
        };

        const handleError = useCallback((error) => {
                console.error('QR Scanner Error:', error);
                console.error('Error name:', error?.name);
                console.error('Error message:', error?.message);

                if (error?.name === 'NotAllowedError') {
                        toast.error('Camera permission denied. Please enable camera access in browser settings.');
                        console.log('Camera permission was denied by user or browser');
                } else if (error?.name === 'NotFoundError') {
                        toast.error('No camera found on this device.');
                        console.log('No camera device found');
                } else if (error?.name === 'NotReadableError') {
                        toast.error('Camera is already in use by another app.');
                        console.log('Camera is being used by another application');
                } else if (error?.name === 'OverconstrainedError') {
                        toast.error('Camera constraints not supported.');
                        console.log('Camera constraints are not supported');
                } else if (error?.name === 'SecurityError') {
                        toast.error('Camera access blocked. Please use HTTPS or localhost.');
                        console.log('Security error - HTTPS required for camera on this device');
                } else {
                        toast.error(`Camera error: ${error?.message || 'Please try again'}`);
                        console.log('Unknown camera error occurred');
                }
        }, []);

        const steps = [
                { icon: QrCode, title: 'Scan QR', desc: 'Point your camera at the vending machine QR code', color: 'blue' },
                { icon: ShoppingCart, title: 'Browse', desc: 'View products with live stock updates', color: 'green' },
                { icon: CreditCard, title: 'Pay', desc: 'Secure checkout via UPI, cards, or wallets', color: 'purple' },
                { icon: Zap, title: 'Collect', desc: 'Product dispensed instantly — enjoy!', color: 'amber' },
        ];

        return (
                <div className="mesh-gradient min-h-screen relative overflow-hidden">
                        {/* Hidden div for image QR scanning */}
                        <div id="qr-image-reader" style={{ display: 'none' }} />

                        {/* Floating background blobs */}
                        <div className="absolute top-20 -left-32 w-96 h-96 rounded-full opacity-30 animate-blob"
                                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)' }} />
                        <div className="absolute top-60 -right-32 w-80 h-80 rounded-full opacity-25 animate-blob"
                                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)', animationDelay: '2s' }} />
                        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-20 animate-blob"
                                style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.3), transparent 70%)', animationDelay: '4s' }} />

                        {/* ====== QR Scanner Modal ====== */}
                        {showScanner && (
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
                                        <div className="glass-strong max-w-md w-full overflow-hidden animate-scale-in">
                                                {/* Header */}
                                                <div className="p-3 sm:p-4 flex items-center justify-between"
                                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                        <div className="flex items-center gap-1.5 sm:gap-2 text-white min-w-0">
                                                                <Camera className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                                                                <h3 className="font-semibold text-base sm:text-lg truncate">Scan QR Code</h3>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                                                {/* Torch toggle */}
                                                                <button onClick={toggleTorch}
                                                                        className={`p-1.5 rounded-xl transition-colors text-white ${torchOn ? 'bg-white/30' : 'hover:bg-white/20'}`}
                                                                        title={torchOn ? 'Turn off torch' : 'Turn on torch'}>
                                                                        {torchOn
                                                                                ? <Flashlight className="w-4 sm:w-5 h-4 sm:h-5" />
                                                                                : <FlashlightOff className="w-4 sm:w-5 h-4 sm:h-5" />}
                                                                </button>
                                                                <button
                                                                        onClick={() => { setShowScanner(false); scanProcessedRef.current = false; setTorchOn(false); }}
                                                                        className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white">
                                                                        <X className="w-4 sm:w-5 h-4 sm:h-5" />
                                                                </button>
                                                        </div>
                                                </div>
                                                {/* Camera feed with green corner brackets */}
                                                <div className="relative aspect-square bg-black">
                                                        <div id={scannerIdRef.current} className="w-full h-full" />
                                                        {/* Corner brackets overlay */}
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <div className="qr-corners w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64" />
                                                        </div>
                                                </div>
                                                <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                                                        {/* Instructions */}
                                                        <p className="text-center text-xs sm:text-sm text-gray-500 font-medium">
                                                                Align the QR code inside the green frame
                                                        </p>

                                                        {/* Gallery Upload Button */}
                                                        <div className="relative">
                                                                <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleImageUpload}
                                                                        className="hidden"
                                                                        id="qr-image-upload"
                                                                />
                                                                <label
                                                                        htmlFor="qr-image-upload"
                                                                        className="flex items-center justify-center gap-1.5 sm:gap-2 w-full py-2.5 sm:py-3 px-3 sm:px-4 bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-primary-400 rounded-xl cursor-pointer transition-all group"
                                                                >
                                                                        <ImageIcon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                                                                        <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-primary-700 transition-colors">
                                                                                Upload from Gallery
                                                                        </span>
                                                                </label>
                                                        </div>

                                                        {/* Debug info */}
                                                        <p className="text-[10px] sm:text-xs text-center text-gray-400 hidden sm:block">
                                                                Check browser console (F12) for camera debug info
                                                        </p>
                                                </div>
                                        </div>
                                </div>
                        )}

                        {/* ====== Hero Section ====== */}
                        <div className="relative max-w-5xl mx-auto px-4 sm:px-5 pt-10 sm:pt-14 pb-3 sm:pb-4 text-center">
                                {/* Pill badge */}
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full mb-5 sm:mb-7 animate-fade-in"
                                        style={{
                                                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                                                border: '1px solid rgba(99,102,241,0.18)',
                                        }}>
                                        <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary-500" />
                                        <span className="text-[10px] sm:text-xs font-semibold text-primary-600 tracking-wide">SMART VENDING REIMAGINED</span>
                                </div>

                                <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 sm:mb-5 animate-slide-up">
                                        <span className="bg-clip-text text-transparent"
                                                style={{ backgroundImage: 'linear-gradient(135deg, #312e81, #4f46e5, #7c3aed)' }}>
                                                Smart Vending
                                        </span>
                                        <br />
                                        <span className="text-gray-800">Machine</span>
                                </h1>

                                {/* Typing tagline */}
                                <div className="h-6 sm:h-8 mb-8 sm:mb-10">
                                        <p className="text-base sm:text-lg md:text-xl text-gray-400 font-light px-4">
                                                {displayed}<span className="animate-pulse text-primary-400">|</span>
                                        </p>
                                </div>
                        </div>

                        {/* ====== QR Hero Card (Reference-inspired) ====== */}
                        <div className="relative max-w-sm mx-auto px-4 sm:px-5 mb-10 sm:mb-12">
                                <div className="qr-hero-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center animate-scale-in"
                                        style={{
                                                background: 'linear-gradient(145deg, #5b5fef, #7c3aed, #6366f1)',
                                                boxShadow: '0 20px 60px rgba(99,102,241,0.35), 0 8px 24px rgba(0,0,0,0.1)',
                                        }}>
                                        {/* QR icon with green corner brackets */}
                                        <button
                                                onClick={() => { scanProcessedRef.current = false; setShowScanner(true); }}
                                                className="relative mx-auto mb-4 sm:mb-5 w-32 h-32 xs:w-36 xs:h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 group cursor-pointer"
                                        >
                                                {/* Green corner brackets - All 4 corners */}
                                                <div className="absolute inset-0 pointer-events-none">
                                                        {/* Top-left */}
                                                        <div className="absolute top-0 left-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 border-l-[3px] border-t-[3px] xs:border-l-[3.5px] xs:border-t-[3.5px] sm:border-l-4 sm:border-t-4 md:border-l-[5px] md:border-t-[5px] border-green-500 rounded-tl-lg sm:rounded-tl-xl animate-corner-pulse" />
                                                        {/* Top-right */}
                                                        <div className="absolute top-0 right-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 border-r-[3px] border-t-[3px] xs:border-r-[3.5px] xs:border-t-[3.5px] sm:border-r-4 sm:border-t-4 md:border-r-[5px] md:border-t-[5px] border-green-500 rounded-tr-lg sm:rounded-tr-xl animate-corner-pulse" style={{ animationDelay: '0.2s' }} />
                                                        {/* Bottom-left */}
                                                        <div className="absolute bottom-0 left-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 border-l-[3px] border-b-[3px] xs:border-l-[3.5px] xs:border-b-[3.5px] sm:border-l-4 sm:border-b-4 md:border-l-[5px] md:border-b-[5px] border-green-500 rounded-bl-lg sm:rounded-bl-xl animate-corner-pulse" style={{ animationDelay: '0.4s' }} />
                                                        {/* Bottom-right */}
                                                        <div className="absolute bottom-0 right-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 border-r-[3px] border-b-[3px] xs:border-r-[3.5px] xs:border-b-[3.5px] sm:border-r-4 sm:border-b-4 md:border-r-[5px] md:border-b-[5px] border-green-500 rounded-br-lg sm:rounded-br-xl animate-corner-pulse" style={{ animationDelay: '0.6s' }} />
                                                </div>
                                                {/* Inner dark square with QR icon */}
                                                <div className="absolute inset-2 sm:inset-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-[1.03]"
                                                        style={{ background: 'rgba(79, 70, 229, 0.55)', backdropFilter: 'blur(4px)' }}>
                                                        <QrCode className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white/70 mb-1 sm:mb-2" strokeWidth={1.5} />
                                                        <span className="text-white font-semibold text-xs sm:text-sm tracking-wide">Tap to scan</span>
                                                </div>
                                        </button>

                                        {/* Tagline with icon */}
                                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                                                <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                                                <p className="text-white font-semibold text-sm sm:text-base">
                                                        Instant vending, every time
                                                </p>
                                        </div>

                                        {/* Action pills */}
                                        <div className="flex gap-2 sm:gap-3">
                                                <button
                                                        onClick={() => { scanProcessedRef.current = false; setShowScanner(true); }}
                                                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                        style={{
                                                                background: 'rgba(255,255,255,0.85)',
                                                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                                        }}>
                                                        <Camera className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                                        <span>Scan QR</span>
                                                </button>
                                                <Link to={`/machine/${testMachines[0].id}`}
                                                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold text-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                                        style={{
                                                                background: 'rgba(255,255,255,0.85)',
                                                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                                        }}>
                                                        <ShoppingCart className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                                        <span className="hidden xs:inline">Browse demo</span>
                                                        <span className="xs:hidden">Demo</span>
                                                </Link>
                                        </div>
                                </div>
                        </div>

                        {/* ====== Stats Bar ====== */}


                        {/* ====== How It Works ====== */}
                        <div className="relative max-w-5xl mx-auto px-4 sm:px-5 py-8 sm:py-10" ref={stepsRef}>
                                <h2 className="text-center text-xs sm:text-sm font-semibold tracking-widest uppercase text-primary-400 mb-2 sm:mb-3">
                                        How It Works
                                </h2>
                                <p className="text-center text-gray-400 text-xs sm:text-sm mb-8 sm:mb-10 max-w-md mx-auto px-4">
                                        Four simple steps from scan to snack. No app download needed.
                                </p>
                                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                                        {steps.map((step, i) => (
                                                <div key={i}
                                                        className={`step-card glass group hover:bg-white/70 p-5 sm:p-7 text-center relative transition-all duration-500 ${stepsVisible ? 'step-card-visible' : 'opacity-0'
                                                                }`}
                                                        style={{
                                                                animationDelay: `${i * 150}ms`,
                                                                transform: stepsVisible ? 'none' : 'translateY(60px) scale(0.9) rotate(2deg)'
                                                        }}>
                                                        <div className={`step-icon glass-icon glass-icon-${step.color} w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                                                                <step.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${step.color === 'blue' ? 'text-primary-500' :
                                                                        step.color === 'green' ? 'text-emerald-500' :
                                                                                step.color === 'purple' ? 'text-accent-500' :
                                                                                        'text-amber-500'
                                                                        }`} />
                                                        </div>
                                                        <div className="text-[9px] sm:text-[10px] font-bold text-primary-300 mb-1.5 sm:mb-2 tracking-[0.2em]">STEP {i + 1}</div>
                                                        <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1.5 sm:mb-2">{step.title}</h3>
                                                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                                                        {i < steps.length - 1 && (
                                                                <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-200" />
                                                        )}
                                                </div>
                                        ))}
                                </div>
                        </div>

                        {/* ====== Demo Machines ====== */}
                        <div className="relative max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
                                <h2 className="text-center text-xs sm:text-sm font-semibold tracking-widest uppercase text-gray-400 mb-1.5 sm:mb-2">
                                        Try Demo Machines
                                </h2>
                                <p className="text-center text-gray-400 text-xs mb-5 sm:mb-7">
                                        Explore our demo machines without scanning a QR code
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                                        {testMachines.map((machine, i) => (
                                                <Link key={machine.id} to={`/machine/${machine.id}`}
                                                        className="glass group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 hover:bg-white/70 hover:-translate-y-1 transition-all duration-300 hover:shadow-glass-lg animate-fade-in"
                                                        style={{ animationDelay: `${i * 0.08}s` }}>
                                                        <span className="text-lg sm:text-xl transition-transform duration-300 group-hover:scale-125">{machine.emoji}</span>
                                                        <span className="font-semibold text-sm sm:text-base text-gray-700 group-hover:text-primary-600 transition-colors">
                                                                {machine.name}
                                                        </span>
                                                        <ChevronRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-300 group-hover:text-primary-400 transition-colors group-hover:translate-x-0.5" />
                                                </Link>
                                        ))}
                                </div>
                        </div>

                        {/* Dev Tools */}
                        {process.env.NODE_ENV === 'development' && (
                                <div className="relative max-w-3xl mx-auto px-5 py-4">
                                        <div className="glass-dark p-5 text-center"
                                                style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(255,251,235,0.5)' }}>
                                                <h2 className="text-xs font-bold text-amber-700 mb-3 tracking-wide uppercase">🧪 Dev Tools</h2>
                                                <div className="flex flex-wrap justify-center gap-2 mb-3">
                                                        {testMachines.map((m) => (
                                                                <Link key={m.id} to={`/machine/${m.id}`}
                                                                        className="px-3 py-1.5 bg-white/60 backdrop-blur border border-amber-200/50 rounded-lg hover:bg-white/80 transition-all text-xs font-medium text-amber-800">
                                                                        {m.name}
                                                                </Link>
                                                        ))}
                                                </div>
                                                <Link to="/admin/qr-generator"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-xs font-semibold">
                                                        <QrCode className="w-3.5 h-3.5" />
                                                        QR Generator
                                                </Link>
                                        </div>
                                </div>
                        )}



                </div>
        );
};

export default HomePage;
