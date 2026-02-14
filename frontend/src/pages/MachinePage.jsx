/**
 * Machine Page
 * 
 * Main vending machine interface accessed via QR code scan.
 * URL: /machine/:machineId
 * 
 * Features:
 * - Extracts machineId from URL
 * - Loads machine info and products
 * - Real-time stock updates
 * - Payment processing
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Components
import Header from '../components/Header';
import ProductList from '../components/ProductList';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentModal, { PAYMENT_STATUS } from '../components/PaymentModal';

// Hooks
import useProducts from '../hooks/useProducts';
import useMachine from '../hooks/useMachine';

// Services
import { createOrder, verifyPayment, dispenseProduct } from '../services/api';
import { openRazorpayCheckout } from '../services/razorpay';

// Constants
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

// Icons for FilterBar
import { Search, X, SlidersHorizontal, Package } from 'lucide-react';

/**
 * Simple FilterBar Component
 * Clean and minimal filtering - ALL products visible by default
 */
const FilterBar = ({
        searchQuery,
        onSearchChange,
        selectedCategory,
        onCategoryChange,
        categories,
        totalProducts,
        filteredCount,
}) => {
        return (
                <div className="glass-strong p-4 animate-fade-in">
                        <div className="flex flex-col gap-4">
                                {/* Top row: Search and stats */}
                                <div className="flex items-center gap-3">
                                        {/* Search Input */}
                                        <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => onSearchChange(e.target.value)}
                                                        placeholder="Search products by name..."
                                                        className="w-full pl-11 pr-10 py-3.5 bg-white/90 border-2 border-gray-200 rounded-xl text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                                                />
                                                {searchQuery && (
                                                        <button
                                                                onClick={() => onSearchChange('')}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                                <X className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                )}
                                        </div>

                                        {/* Product count badge */}
                                        <div className="hidden sm:flex items-center gap-2 px-4 py-3.5 bg-primary-50 border-2 border-primary-200 rounded-xl">
                                                <Package className="w-5 h-5 text-primary-600" />
                                                <span className="text-sm font-bold text-primary-700">
                                                        {filteredCount} / {totalProducts}
                                                </span>
                                        </div>
                                </div>

                                {/* Category Pills */}
                                {categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                                <button
                                                        onClick={() => onCategoryChange('all')}
                                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${selectedCategory === 'all'
                                                                ? 'bg-primary-600 text-white shadow-md scale-105'
                                                                : 'bg-white/90 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                                                                }`}
                                                >
                                                        All Products
                                                </button>
                                                {categories.map((category) => (
                                                        <button
                                                                key={category}
                                                                onClick={() => onCategoryChange(category)}
                                                                className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${selectedCategory === category
                                                                        ? 'bg-primary-600 text-white shadow-md scale-105'
                                                                        : 'bg-white/90 text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                                                                        }`}
                                                        >
                                                                {category}
                                                        </button>
                                                ))}
                                        </div>
                                )}
                        </div>
                </div>
        );
};

const MachinePage = () => {
        // Get machineId from URL params
        const { machineId } = useParams();
        const navigate = useNavigate();

        // Fetch machine data with real-time updates
        const {
                machine,
                loading: machineLoading,
                error: machineError,
                isOnline
        } = useMachine(machineId);

        // Fetch products with real-time updates
        const {
                products,
                loading: productsLoading,
                error: productsError,
                refresh: refreshProducts
        } = useProducts(machineId);

        // Payment state
        const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.IDLE);
        const [purchasingProduct, setPurchasingProduct] = useState(null);
        const [paymentMessage, setPaymentMessage] = useState('');

        // Simple Filter state - ONLY search and category
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedCategory, setSelectedCategory] = useState('all');

        /**
         * Handle product purchase
         * Complete flow: Create Order → Razorpay Checkout → Verify Payment
         */
        const handleBuyProduct = useCallback(async (product) => {
                // Prevent multiple purchases
                if (paymentStatus !== PAYMENT_STATUS.IDLE) {
                        toast.error('A purchase is already in progress');
                        return;
                }

                // Check if machine is online
                if (!isOnline) {
                        toast.error(ERROR_MESSAGES.MACHINE_OFFLINE);
                        return;
                }

                // Check stock
                if (product.stock <= 0) {
                        toast.error(ERROR_MESSAGES.OUT_OF_STOCK);
                        return;
                }

                setPurchasingProduct(product);
                setPaymentMessage('');

                console.log('🛒 [Buy Product] Starting purchase:', {
                        productId: product.id,
                        productName: product.name,
                        machineId: machineId,
                        price: product.price,
                        stock: product.stock
                });

                try {
                        // ========================================
                        // Step 1: Create Razorpay Order (Backend)
                        // ========================================
                        setPaymentStatus(PAYMENT_STATUS.CREATING_ORDER);

                        const orderResponse = await createOrder(product.id, machineId);

                        if (!orderResponse.success) {
                                throw new Error(orderResponse.error || 'Failed to create order');
                        }

                        console.log('Order created:', orderResponse);

                        // ========================================
                        // Step 2: Open Razorpay Checkout (Frontend)
                        // ========================================
                        setPaymentStatus(PAYMENT_STATUS.AWAITING_PAYMENT);

                        const paymentResponse = await openRazorpayCheckout({
                                orderId: orderResponse.razorpayOrderId,
                                amount: orderResponse.amount,
                                currency: orderResponse.currency,
                                keyId: orderResponse.keyId,
                                productName: orderResponse.productName,
                        });

                        console.log('Payment completed:', paymentResponse);

                        // ========================================
                        // Step 3: Verify Payment (Backend)
                        // ========================================
                        setPaymentStatus(PAYMENT_STATUS.VERIFYING);

                        const verifyResponse = await verifyPayment(
                                paymentResponse,
                                product.id,
                                machineId,
                                orderResponse.orderId
                        );

                        if (!verifyResponse.success) {
                                throw new Error(verifyResponse.error || 'Payment verification failed');
                        }

                        console.log('Payment verified:', verifyResponse);

                        // ========================================
                        // Step 4: Success! Trigger Dispense
                        // ========================================
                        setPaymentStatus(PAYMENT_STATUS.SUCCESS);
                        setPaymentMessage(verifyResponse.message || SUCCESS_MESSAGES.PAYMENT_SUCCESS);

                        toast.success(SUCCESS_MESSAGES.PAYMENT_SUCCESS, {
                                duration: 5000,
                                icon: '🎉',
                        });

                        // Trigger dispense (fire and forget)
                        dispenseProduct(machineId, product.id, verifyResponse.orderId)
                                .then(() => console.log('Dispense triggered'))
                                .catch((err) => console.error('Dispense error:', err));

                } catch (error) {
                        console.error('Purchase error:', error);

                        const errorMessage = error.message || ERROR_MESSAGES.GENERIC_ERROR;

                        // Check if user cancelled
                        if (errorMessage.includes('cancelled')) {
                                setPaymentStatus(PAYMENT_STATUS.IDLE);
                                setPurchasingProduct(null);
                                toast.error(ERROR_MESSAGES.PAYMENT_CANCELLED);
                                return;
                        }

                        setPaymentStatus(PAYMENT_STATUS.ERROR);
                        setPaymentMessage(errorMessage);

                        toast.error(errorMessage);
                }
        }, [machineId, isOnline, paymentStatus]);

        /**
         * Close payment modal and reset state
         */
        const handleClosePaymentModal = useCallback(() => {
                setPaymentStatus(PAYMENT_STATUS.IDLE);
                setPurchasingProduct(null);
                setPaymentMessage('');
        }, []);

        /**
         * Simple filtering - ALL products visible by default
         * Only filters: search query and category selection
         */
        const filteredAndSortedProducts = useMemo(() => {
                if (!products || products.length === 0) {
                        return [];
                }

                let filtered = [...products];

                // Category filter
                if (selectedCategory !== 'all') {
                        filtered = filtered.filter(p => p.category === selectedCategory);
                }

                // Search filter
                if (searchQuery.trim()) {
                        const query = searchQuery.toLowerCase();
                        filtered = filtered.filter(p =>
                                p.name.toLowerCase().includes(query) ||
                                p.description?.toLowerCase().includes(query)
                        );
                }

                // Simple alphabetical sort
                filtered.sort((a, b) => a.name.localeCompare(b.name));

                return filtered;
        }, [products, selectedCategory, searchQuery]);

        /**
         * Extract unique categories from products
         */
        const categories = useMemo(() => {
                if (!products || products.length === 0) return [];
                const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
                return uniqueCategories.sort();
        }, [products]);

        // ========================================
        // RENDER: Loading State
        // ========================================
        if (machineLoading) {
                return <LoadingSpinner fullScreen message="Loading vending machine..." />;
        }

        // ========================================
        // RENDER: Machine Not Found
        // ========================================
        if (machineError || !machine) {
                return (
                        <div className="mesh-gradient min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
                                <div className="absolute top-20 -right-20 w-72 h-72 rounded-full opacity-20 animate-blob"
                                        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)' }} />
                                <div className="glass-strong p-10 max-w-md w-full text-center animate-scale-in"
                                        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.08)' }}>
                                        <div className="glass-icon w-20 h-20 mx-auto mb-6"
                                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)' }}>
                                                <span className="text-4xl">🔍</span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-800 mb-3">Machine Not Found</h1>
                                        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                                                {machineError || ERROR_MESSAGES.MACHINE_NOT_FOUND}
                                        </p>
                                        <p className="text-sm text-gray-400 mb-6">
                                                Machine ID: <code className="bg-white/50 backdrop-blur px-2 py-0.5 rounded-lg border border-white/60 text-xs font-mono">{machineId}</code>
                                        </p>
                                        <button onClick={() => navigate('/')}
                                                className="px-7 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
                                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                                                Go Home
                                        </button>
                                </div>
                        </div>
                );
        }

        // ========================================
        // RENDER: Main Page
        // ========================================
        return (
                <div className="mesh-gradient min-h-screen safe-area-padding relative">
                        {/* Subtle background blobs */}
                        <div className="fixed top-40 -left-40 w-96 h-96 rounded-full opacity-15 pointer-events-none"
                                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)' }} />
                        <div className="fixed bottom-20 -right-40 w-80 h-80 rounded-full opacity-10 pointer-events-none"
                                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)' }} />

                        {/* Header with machine info */}
                        <Header
                                machine={machine}
                                isOnline={isOnline}
                                loading={productsLoading}
                        />

                        {/* Filter Bar */}
                        <div className="relative max-w-7xl mx-auto px-5 pt-4 pb-2">
                                <FilterBar
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        selectedCategory={selectedCategory}
                                        onCategoryChange={setSelectedCategory}
                                        categories={categories}
                                        totalProducts={products?.length || 0}
                                        filteredCount={filteredAndSortedProducts.length}
                                />
                        </div>

                        {/* Product Grid */}
                        <main className="relative max-w-7xl mx-auto">
                                <ProductList
                                        products={filteredAndSortedProducts}
                                        loading={productsLoading}
                                        error={productsError}
                                        machineOnline={isOnline}
                                        onBuyProduct={handleBuyProduct}
                                        purchasingProductId={purchasingProduct?.id}
                                        onRefresh={refreshProducts}
                                />
                        </main>

                        {/* Payment Status Modal */}
                        <PaymentModal
                                isOpen={paymentStatus !== PAYMENT_STATUS.IDLE}
                                status={paymentStatus}
                                product={purchasingProduct}
                                message={paymentMessage}
                                onClose={handleClosePaymentModal}
                        />
                </div>
        );
};

export default MachinePage;
