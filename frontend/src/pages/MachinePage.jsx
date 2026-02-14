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
import { Search, X, RotateCcw, Coffee, Cookie, Droplet, Candy, Beef, Grid3x3, ArrowUpDown } from 'lucide-react';

/**
 * Category icon and info mapping
 */
const CATEGORY_CONFIG = {
        beverages: {
                icon: Coffee,
                label: 'Beverages',
                emoji: '☕',
                color: 'from-blue-400 to-cyan-500',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-600',
                borderColor: 'border-blue-200',
        },
        snacks: {
                icon: Cookie,
                label: 'Snacks',
                emoji: '🍪',
                color: 'from-amber-400 to-orange-500',
                bgColor: 'bg-amber-50',
                textColor: 'text-amber-600',
                borderColor: 'border-amber-200',
        },
        chocolates: {
                icon: Candy,
                label: 'Chocolates',
                emoji: '🍫',
                color: 'from-purple-400 to-pink-500',
                bgColor: 'bg-purple-50',
                textColor: 'text-purple-600',
                borderColor: 'border-purple-200',
        },
        water: {
                icon: Droplet,
                label: 'Water',
                emoji: '💧',
                color: 'from-cyan-400 to-blue-500',
                bgColor: 'bg-cyan-50',
                textColor: 'text-cyan-600',
                borderColor: 'border-cyan-200',
        },
        food: {
                icon: Beef,
                label: 'Food Items',
                emoji: '🍔',
                color: 'from-red-400 to-orange-500',
                bgColor: 'bg-red-50',
                textColor: 'text-red-600',
                borderColor: 'border-red-200',
        },
};

/**
 * FilterBar Component
 * Provides category-based filtering with search and advanced options
 */
const FilterBar = ({
        searchQuery,
        onSearchChange,
        selectedCategory,
        onCategoryChange,
        categories,
        getCategoryCount,
        sortBy,
        onSortChange,
        priceRange,
        onPriceRangeChange,
        maxPrice,
        stockFilter,
        onStockFilterChange,
        showAdvancedFilters,
        onToggleAdvancedFilters,
        onResetFilters,
        totalProducts,
        filteredCount,
}) => {
        const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'name' || priceRange[0] > 0 || priceRange[1] < maxPrice || stockFilter !== 'all';

        return (
                <div className="space-y-4 animate-fade-in">
                        {/* Search Bar */}
                        <div className="glass-strong p-4">
                                <div className="flex items-center gap-3">
                                        {/* Search Input */}
                                        <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                        type="text"
                                                        value={searchQuery}
                                                        onChange={(e) => onSearchChange(e.target.value)}
                                                        placeholder="Search products..."
                                                        className="w-full pl-10 pr-10 py-3 bg-white/70 border border-white/60 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                                />
                                                {searchQuery && (
                                                        <button
                                                                onClick={() => onSearchChange('')}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/50 rounded-lg transition-colors"
                                                        >
                                                                <X className="w-3.5 h-3.5 text-gray-400" />
                                                        </button>
                                                )}
                                        </div>

                                        {/* Advanced Filters Toggle */}
                                        <button
                                                onClick={onToggleAdvancedFilters}
                                                className={`px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:scale-[1.02] ${showAdvancedFilters
                                                        ? 'bg-primary-500 text-white shadow-lg'
                                                        : 'bg-white/70 text-gray-700 border border-white/60'
                                                        }`}
                                        >
                                                <ArrowUpDown className="w-4 h-4" />
                                                <span className="hidden sm:inline">Sort & Filter</span>
                                        </button>

                                        {/* Reset Button */}
                                        {hasActiveFilters && (
                                                <button
                                                        onClick={onResetFilters}
                                                        className="p-3 bg-white/70 border border-white/60 rounded-xl hover:bg-white/90 transition-all"
                                                        title="Reset all filters"
                                                >
                                                        <RotateCcw className="w-4 h-4 text-gray-600" />
                                                </button>
                                        )}
                                </div>
                        </div>

                        {/* Category Cards */}
                        <div className="glass-strong p-3">
                                <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                                <Grid3x3 className="w-3.5 h-3.5 text-primary-500" />
                                                Categories
                                        </h3>
                                        <span className="text-xs text-gray-500 font-medium">
                                                {filteredCount} of {totalProducts}
                                        </span>
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                                        {/* All Products */}
                                        <button
                                                onClick={() => onCategoryChange('all')}
                                                className={`group relative overflow-hidden rounded-lg p-2.5 border-2 transition-all duration-300 ${selectedCategory === 'all'
                                                        ? 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-400 shadow-md scale-[1.02]'
                                                        : 'bg-white/60 border-white/80 hover:border-primary-200 hover:bg-white/80'
                                                        }`}
                                        >
                                                <div className="relative z-10">
                                                        <div className="flex items-center justify-center w-8 h-8 mx-auto mb-1.5 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-sm group-hover:scale-110 transition-transform">
                                                                <Grid3x3 className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="text-xs font-bold text-gray-800 mb-0.5">All</h4>
                                                        <p className="text-[10px] text-gray-500 font-semibold">{totalProducts}</p>
                                                </div>
                                                {selectedCategory === 'all' && (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 to-primary-600/10 animate-pulse" />
                                                )}
                                        </button>

                                        {/* Category Cards */}
                                        {categories.map((category) => {
                                                const config = CATEGORY_CONFIG[category] || {
                                                        icon: Grid3x3,
                                                        label: category.charAt(0).toUpperCase() + category.slice(1),
                                                        emoji: '📦',
                                                        color: 'from-gray-400 to-gray-600',
                                                        bgColor: 'bg-gray-50',
                                                        textColor: 'text-gray-600',
                                                        borderColor: 'border-gray-200',
                                                };
                                                const Icon = config.icon;
                                                const count = getCategoryCount(category);

                                                return (
                                                        <button
                                                                key={category}
                                                                onClick={() => onCategoryChange(category)}
                                                                className={`group relative overflow-hidden rounded-lg p-2.5 border-2 transition-all duration-300 ${selectedCategory === category
                                                                        ? `${config.bgColor} ${config.borderColor} shadow-md scale-[1.02]`
                                                                        : 'bg-white/60 border-white/80 hover:border-gray-300 hover:bg-white/80'
                                                                        }`}
                                                        >
                                                                <div className="relative z-10">
                                                                        <div className={`flex items-center justify-center w-8 h-8 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${config.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                                                                                <Icon className="w-4 h-4" />
                                                                        </div>
                                                                        <h4 className="text-xs font-bold text-gray-800 mb-0.5 truncate">{config.label}</h4>
                                                                        <p className="text-[10px] text-gray-500 font-semibold">{count}</p>
                                                                </div>
                                                                {selectedCategory === category && (
                                                                        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5 animate-pulse`} />
                                                                )}
                                                        </button>
                                                );
                                        })}
                                </div>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                                <div className="glass-strong p-4 animate-slide-down">
                                        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                                <ArrowUpDown className="w-3.5 h-3.5" />
                                                Sort & Advanced Filters
                                        </h3>
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {/* Sort By */}
                                                <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Sort By</label>
                                                        <select
                                                                value={sortBy}
                                                                onChange={(e) => onSortChange(e.target.value)}
                                                                className="w-full px-3 py-2.5 bg-white/80 border-2 border-white/60 rounded-xl text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent cursor-pointer transition-all hover:bg-white"
                                                        >
                                                                <option value="name">📝 Name (A-Z)</option>
                                                                <option value="price-low">💰 Price: Low → High</option>
                                                                <option value="price-high">💎 Price: High → Low</option>
                                                                <option value="stock">📦 Stock Availability</option>
                                                        </select>
                                                </div>

                                                {/* Price Range */}
                                                <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                                                Price Range
                                                        </label>
                                                        <div className="bg-white/60 border-2 border-white/60 rounded-xl p-3">
                                                                <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-xs font-bold text-primary-600">₹{priceRange[0]}</span>
                                                                        <span className="text-xs text-gray-400">to</span>
                                                                        <span className="text-xs font-bold text-primary-600">₹{priceRange[1]}</span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                        <input
                                                                                type="range"
                                                                                min={0}
                                                                                max={maxPrice}
                                                                                value={priceRange[0]}
                                                                                onChange={(e) => onPriceRangeChange([+e.target.value, priceRange[1]])}
                                                                                className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer slider"
                                                                        />
                                                                        <input
                                                                                type="range"
                                                                                min={0}
                                                                                max={maxPrice}
                                                                                value={priceRange[1]}
                                                                                onChange={(e) => onPriceRangeChange([priceRange[0], +e.target.value])}
                                                                                className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer slider"
                                                                        />
                                                                </div>
                                                        </div>
                                                </div>

                                                {/* Stock Filter */}
                                                <div>
                                                        <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Stock Status</label>
                                                        <div className="flex gap-2">
                                                                <button
                                                                        onClick={() => onStockFilterChange('all')}
                                                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${stockFilter === 'all'
                                                                                ? 'bg-primary-500 text-white shadow-md'
                                                                                : 'bg-white/60 text-gray-600 hover:bg-white/80'
                                                                                }`}
                                                                >
                                                                        All
                                                                </button>
                                                                <button
                                                                        onClick={() => onStockFilterChange('in-stock')}
                                                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${stockFilter === 'in-stock'
                                                                                ? 'bg-emerald-500 text-white shadow-md'
                                                                                : 'bg-white/60 text-gray-600 hover:bg-white/80'
                                                                                }`}
                                                                >
                                                                        In Stock
                                                                </button>
                                                                <button
                                                                        onClick={() => onStockFilterChange('low-stock')}
                                                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${stockFilter === 'low-stock'
                                                                                ? 'bg-amber-500 text-white shadow-md'
                                                                                : 'bg-white/60 text-gray-600 hover:bg-white/80'
                                                                                }`}
                                                                >
                                                                        Low Stock
                                                                </button>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        )}
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

        // Filter & Sort state
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedCategory, setSelectedCategory] = useState('all');
        const [sortBy, setSortBy] = useState('name'); // name, price-low, price-high, stock
        const [priceRange, setPriceRange] = useState([0, 1000]);
        const [stockFilter, setStockFilter] = useState('all'); // all, in-stock, low-stock
        const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
         * Filter and sort products based on user selections
         */
        const filteredAndSortedProducts = useMemo(() => {
                if (!products || products.length === 0) return [];

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

                // Price range filter
                filtered = filtered.filter(p =>
                        p.price >= priceRange[0] && p.price <= priceRange[1]
                );

                // Stock filter
                if (stockFilter === 'in-stock') {
                        filtered = filtered.filter(p => p.stock > 0);
                } else if (stockFilter === 'low-stock') {
                        filtered = filtered.filter(p => p.stock > 0 && p.stock <= 3);
                }

                // Sort
                filtered.sort((a, b) => {
                        switch (sortBy) {
                                case 'price-low':
                                        return a.price - b.price;
                                case 'price-high':
                                        return b.price - a.price;
                                case 'stock':
                                        return b.stock - a.stock;
                                case 'name':
                                default:
                                        return a.name.localeCompare(b.name);
                        }
                });

                return filtered;
        }, [products, selectedCategory, searchQuery, sortBy, priceRange, stockFilter]);

        /**
         * Get max price from products for price range slider
         */
        const maxPrice = useMemo(() => {
                if (!products || products.length === 0) return 1000;
                return Math.max(...products.map(p => p.price), 100);
        }, [products]);

        /**
         * Extract unique categories from products
         */
        const categories = useMemo(() => {
                if (!products || products.length === 0) return [];
                const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
                return uniqueCategories;
        }, [products]);

        /**
         * Get count of products per category
         */
        const getCategoryCount = useCallback((category) => {
                if (!products) return 0;
                return products.filter(p => p.category === category).length;
        }, [products]);

        /**
         * Reset all filters
         */
        const handleResetFilters = useCallback(() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSortBy('name');
                setPriceRange([0, maxPrice]);
                setStockFilter('all');
        }, [maxPrice]);

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
                                        getCategoryCount={getCategoryCount}
                                        sortBy={sortBy}
                                        onSortChange={setSortBy}
                                        priceRange={priceRange}
                                        onPriceRangeChange={setPriceRange}
                                        maxPrice={maxPrice}
                                        stockFilter={stockFilter}
                                        onStockFilterChange={setStockFilter}
                                        showAdvancedFilters={showAdvancedFilters}
                                        onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        onResetFilters={handleResetFilters}
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
