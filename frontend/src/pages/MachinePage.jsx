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

import React, { useState, useCallback } from 'react';
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
                        <div className="page-container min-h-screen flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <span className="text-4xl">🔍</span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                                Machine Not Found
                                        </h1>
                                        <p className="text-gray-600 mb-6">
                                                {machineError || ERROR_MESSAGES.MACHINE_NOT_FOUND}
                                        </p>
                                        <p className="text-sm text-gray-500 mb-6">
                                                Machine ID: <code className="bg-gray-100 px-2 py-1 rounded">{machineId}</code>
                                        </p>
                                        <button
                                                onClick={() => navigate('/')}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
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
                <div className="page-container min-h-screen safe-area-padding">
                        {/* Header with machine info */}
                        <Header
                                machine={machine}
                                isOnline={isOnline}
                                loading={productsLoading}
                        />

                        {/* Product Grid */}
                        <main className="max-w-7xl mx-auto">
                                <ProductList
                                        products={products}
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
