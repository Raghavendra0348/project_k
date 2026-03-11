/**
 * Admin Dashboard Page
 *
 * Admin interface for managing vending machines.
 * Features:
 * - View low stock alerts
 * - Acknowledge and resolve alerts
 * - Full product CRUD management
 * - Add, edit, delete products
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAllProducts from '../hooks/useAllProducts';
import useAllMachines from '../hooks/useAllMachines';
import {
        AlertTriangle,
        Package,
        CheckCircle,
        Bell,
        RefreshCw,
        MapPin,
        Clock,
        ArrowLeft,
        Filter,
        Loader2,
        PackageX,
        AlertCircle,
        Plus,
        Edit2,
        Trash2,
        Save,
        X,
        Search,
        Boxes,
        TrendingUp,
        TrendingDown,
        Flame,
        BarChart3,
        Sun,
        Cloud,
        Snowflake,
        Leaf,
        PieChart as PieChartIcon,
} from 'lucide-react';
import {
        PieChart,
        Pie,
        Cell,
        BarChart,
        Bar,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
        ResponsiveContainer,
        AreaChart,
        Area,
} from 'recharts';
import toast from 'react-hot-toast';
import {
        getStockAlerts,
        acknowledgeAlert,
        resolveAlert,
        getLowStockProducts,
        checkAllStock,
        createProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
} from '../services/api';

// ============================================
// HELPER COMPONENTS
// ============================================

const StatusBadge = ({ status }) => {
        const styles = {
                pending: 'bg-red-100 text-red-700 border-red-200',
                acknowledged: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                resolved: 'bg-green-100 text-green-700 border-green-200',
        };

        const icons = {
                pending: <AlertTriangle className="w-3 h-3" />,
                acknowledged: <Clock className="w-3 h-3" />,
                resolved: <CheckCircle className="w-3 h-3" />,
        };

        return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
                        {icons[status]}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
        );
};

const StockLevelIndicator = ({ stock }) => {
        let color = 'text-green-600 bg-green-100';
        if (stock === 0) color = 'text-red-600 bg-red-100';
        else if (stock <= 2) color = 'text-orange-600 bg-orange-100';
        else if (stock <= 5) color = 'text-yellow-600 bg-yellow-100';

        return (
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${color}`}>
                        {stock}
                </span>
        );
};

// Trending Badge Component
const TrendingBadge = ({ trending, salesData }) => {
        if (!trending?.isTrending) return null;

        return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                        <Flame className="w-3 h-3" />
                        #{trending.rank}
                </span>
        );
};

// Sales Trend Indicator
const SalesTrendIndicator = ({ salesData }) => {
        if (!salesData) return <span className="text-gray-400 text-xs">No data</span>;

        const { lastWeek, trend, percentChange } = salesData;

        const trendColors = {
                up: 'text-green-600',
                down: 'text-red-600',
                stable: 'text-gray-500',
        };

        const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : BarChart3;

        return (
                <div className="flex flex-col items-center">
                        <span className="font-semibold text-gray-800">{lastWeek}</span>
                        <span className={`flex items-center gap-0.5 text-xs ${trendColors[trend]}`}>
                                <TrendIcon className="w-3 h-3" />
                                {percentChange > 0 ? '+' : ''}{percentChange}%
                        </span>
                </div>
        );
};

// Season Badge
const SeasonBadge = ({ season }) => {
        const seasonConfig = {
                summer: { icon: Sun, color: 'bg-yellow-100 text-yellow-700', label: 'Summer' },
                monsoon: { icon: Cloud, color: 'bg-blue-100 text-blue-700', label: 'Monsoon' },
                winter: { icon: Snowflake, color: 'bg-cyan-100 text-cyan-700', label: 'Winter' },
                autumn: { icon: Leaf, color: 'bg-orange-100 text-orange-700', label: 'Autumn' },
                'all-season': { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'All Season' },
        };

        const config = seasonConfig[season] || seasonConfig['all-season'];
        const Icon = config.icon;

        return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                </span>
        );
};

// Chart colors
const STOCK_COLORS = {
        healthy: '#10b981',
        low: '#f59e0b',
        critical: '#ef4444',
        outOfStock: '#6b7280'
};

// Analytics Dashboard Component
const AnalyticsDashboard = ({ products, machines, lowStockProducts }) => {
        // Stock Distribution Data for Pie Chart
        const stockDistributionData = useMemo(() => {
                const outOfStock = products.filter(p => p.stock === 0).length;
                const critical = products.filter(p => p.stock > 0 && p.stock <= 2).length;
                const low = products.filter(p => p.stock > 2 && p.stock <= 5).length;
                const healthy = products.filter(p => p.stock > 5).length;

                return [
                        { name: 'Healthy (>5)', value: healthy, color: STOCK_COLORS.healthy },
                        { name: 'Low (3-5)', value: low, color: STOCK_COLORS.low },
                        { name: 'Critical (1-2)', value: critical, color: STOCK_COLORS.critical },
                        { name: 'Out of Stock', value: outOfStock, color: STOCK_COLORS.outOfStock },
                ].filter(item => item.value > 0);
        }, [products]);

        // Sales by Category Data for Bar Chart
        const salesByCategoryData = useMemo(() => {
                const categoryMap = {};
                products.forEach(product => {
                        const category = product.category || 'general';
                        if (!categoryMap[category]) {
                                categoryMap[category] = {
                                        category: category.charAt(0).toUpperCase() + category.slice(1),
                                        sales: 0,
                                        stock: 0,
                                        products: 0
                                };
                        }
                        categoryMap[category].sales += product.salesData?.lastWeek || 0;
                        categoryMap[category].stock += product.stock || 0;
                        categoryMap[category].products += 1;
                });
                return Object.values(categoryMap).sort((a, b) => b.sales - a.sales);
        }, [products]);

        // Machine-wise Stock Data
        const machineStockData = useMemo(() => {
                return machines.map(machine => {
                        const machineProducts = products.filter(p => p.machineId === machine.id);
                        const totalStock = machineProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
                        const totalSales = machineProducts.reduce((sum, p) => sum + (p.salesData?.lastWeek || 0), 0);
                        const lowStockCount = machineProducts.filter(p => p.stock <= 3).length;
                        return {
                                name: machine.location?.substring(0, 15) || machine.id,
                                stock: totalStock,
                                sales: totalSales,
                                lowStock: lowStockCount,
                                products: machineProducts.length
                        };
                });
        }, [products, machines]);

        // Top Products by Sales
        const topProductsData = useMemo(() => {
                return [...products]
                        .filter(p => p.salesData?.lastWeek > 0)
                        .sort((a, b) => (b.salesData?.lastWeek || 0) - (a.salesData?.lastWeek || 0))
                        .slice(0, 8)
                        .map(p => ({
                                name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
                                sales: p.salesData?.lastWeek || 0,
                                stock: p.stock,
                                fullName: p.name
                        }));
        }, [products]);

        // Stock vs Sales Comparison
        const stockVsSalesData = useMemo(() => {
                const categories = ['beverages', 'snacks', 'chocolates', 'water', 'general'];
                return categories.map(cat => {
                        const catProducts = products.filter(p => (p.category || 'general') === cat);
                        return {
                                category: cat.charAt(0).toUpperCase() + cat.slice(1),
                                stock: catProducts.reduce((sum, p) => sum + (p.stock || 0), 0),
                                sales: catProducts.reduce((sum, p) => sum + (p.salesData?.lastWeek || 0), 0),
                        };
                }).filter(item => item.stock > 0 || item.sales > 0);
        }, [products]);

        // Trending vs Non-Trending
        const trendingData = useMemo(() => {
                const trending = products.filter(p => p.trending?.isTrending);
                const nonTrending = products.filter(p => !p.trending?.isTrending);
                return [
                        {
                                name: 'Trending',
                                value: trending.length,
                                sales: trending.reduce((sum, p) => sum + (p.salesData?.lastWeek || 0), 0),
                                color: '#f97316'
                        },
                        {
                                name: 'Regular',
                                value: nonTrending.length,
                                sales: nonTrending.reduce((sum, p) => sum + (p.salesData?.lastWeek || 0), 0),
                                color: '#6366f1'
                        },
                ];
        }, [products]);

        // Custom Tooltip for Pie Chart
        const CustomPieTooltip = ({ active, payload }) => {
                if (active && payload && payload.length) {
                        return (
                                <div className="bg-white p-3 rounded-lg shadow-lg border">
                                        <p className="font-semibold">{payload[0].name}</p>
                                        <p className="text-sm text-gray-600">{payload[0].value} products</p>
                                        <p className="text-xs text-gray-400">
                                                {((payload[0].value / products.length) * 100).toFixed(1)}% of total
                                        </p>
                                </div>
                        );
                }
                return null;
        };

        // Custom Label for Pie Chart
        const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                if (percent < 0.05) return null;
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
                                {`${(percent * 100).toFixed(0)}%`}
                        </text>
                );
        };

        return (
                <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                                        <div className="flex items-center justify-between">
                                                <div>
                                                        <p className="text-sm text-green-600 font-medium">Healthy Stock</p>
                                                        <p className="text-2xl font-bold text-green-700">
                                                                {products.filter(p => p.stock > 5).length}
                                                        </p>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                </div>
                                        </div>
                                        <p className="text-xs text-green-500 mt-2">Products with stock &gt; 5</p>
                                </div>

                                <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
                                        <div className="flex items-center justify-between">
                                                <div>
                                                        <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
                                                        <p className="text-2xl font-bold text-yellow-700">
                                                                {products.filter(p => p.stock > 0 && p.stock <= 5).length}
                                                        </p>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center">
                                                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                                                </div>
                                        </div>
                                        <p className="text-xs text-yellow-500 mt-2">Need restocking soon</p>
                                </div>

                                <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                                        <div className="flex items-center justify-between">
                                                <div>
                                                        <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                                                        <p className="text-2xl font-bold text-red-700">
                                                                {products.filter(p => p.stock === 0).length}
                                                        </p>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                                                        <PackageX className="w-6 h-6 text-red-600" />
                                                </div>
                                        </div>
                                        <p className="text-xs text-red-500 mt-2">Requires immediate action</p>
                                </div>

                                <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                                        <div className="flex items-center justify-between">
                                                <div>
                                                        <p className="text-sm text-purple-600 font-medium">Avg Weekly Sales</p>
                                                        <p className="text-2xl font-bold text-purple-700">
                                                                {products.length > 0
                                                                        ? Math.round(products.reduce((sum, p) => sum + (p.salesData?.lastWeek || 0), 0) / products.length)
                                                                        : 0}
                                                        </p>
                                                </div>
                                                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                                </div>
                                        </div>
                                        <p className="text-xs text-purple-500 mt-2">Per product average</p>
                                </div>
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Stock Distribution Pie Chart */}
                                <div className="glass-card p-6 rounded-2xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                                                Stock Distribution
                                        </h3>
                                        {stockDistributionData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={280}>
                                                        <PieChart>
                                                                <Pie
                                                                        data={stockDistributionData}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        labelLine={false}
                                                                        label={renderCustomLabel}
                                                                        outerRadius={100}
                                                                        fill="#8884d8"
                                                                        dataKey="value"
                                                                >
                                                                        {stockDistributionData.map((entry, index) => (
                                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                                        ))}
                                                                </Pie>
                                                                <Tooltip content={<CustomPieTooltip />} />
                                                                <Legend
                                                                        verticalAlign="bottom"
                                                                        height={36}
                                                                        formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                                                                />
                                                        </PieChart>
                                                </ResponsiveContainer>
                                        ) : (
                                                <div className="h-64 flex items-center justify-center text-gray-400">
                                                        No stock data available
                                                </div>
                                        )}
                                </div>

                                {/* Sales by Category Bar Chart */}
                                <div className="glass-card p-6 rounded-2xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <BarChart3 className="w-5 h-5 text-indigo-500" />
                                                Sales by Category
                                        </h3>
                                        {salesByCategoryData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={280}>
                                                        <BarChart data={salesByCategoryData} layout="vertical">
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                                                <YAxis dataKey="category" type="category" tick={{ fontSize: 12 }} width={80} />
                                                                <Tooltip
                                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                        formatter={(value, name) => [value, name === 'sales' ? 'Weekly Sales' : 'Total Stock']}
                                                                />
                                                                <Bar dataKey="sales" fill="#6366f1" radius={[0, 4, 4, 0]} name="Weekly Sales" />
                                                        </BarChart>
                                                </ResponsiveContainer>
                                        ) : (
                                                <div className="h-64 flex items-center justify-center text-gray-400">
                                                        No sales data available
                                                </div>
                                        )}
                                </div>
                        </div>

                        {/* Charts Row 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Top Products Chart */}
                                <div className="glass-card p-6 rounded-2xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Flame className="w-5 h-5 text-orange-500" />
                                                Top Selling Products
                                        </h3>
                                        {topProductsData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={280}>
                                                        <BarChart data={topProductsData}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                                                                <YAxis tick={{ fontSize: 12 }} />
                                                                <Tooltip
                                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                        formatter={(value, name) => [value, name === 'sales' ? 'Sales' : 'Stock']}
                                                                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                                                                />
                                                                <Legend />
                                                                <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} name="Sales" />
                                                                <Bar dataKey="stock" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Stock" />
                                                        </BarChart>
                                                </ResponsiveContainer>
                                        ) : (
                                                <div className="h-64 flex items-center justify-center text-gray-400">
                                                        No sales data available
                                                </div>
                                        )}
                                </div>

                                {/* Machine Performance */}
                                <div className="glass-card p-6 rounded-2xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-indigo-500" />
                                                Machine-wise Overview
                                        </h3>
                                        {machineStockData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={280}>
                                                        <BarChart data={machineStockData}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                                                                <YAxis tick={{ fontSize: 12 }} />
                                                                <Tooltip
                                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                />
                                                                <Legend />
                                                                <Bar dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]} name="Stock" />
                                                                <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sales" />
                                                                <Bar dataKey="lowStock" fill="#ef4444" radius={[4, 4, 0, 0]} name="Low Stock Items" />
                                                        </BarChart>
                                                </ResponsiveContainer>
                                        ) : (
                                                <div className="h-64 flex items-center justify-center text-gray-400">
                                                        No machine data available
                                                </div>
                                        )}
                                </div>
                        </div>

                        {/* Charts Row 3 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Stock vs Sales Area Chart */}
                                <div className="glass-card p-6 rounded-2xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-green-500" />
                                                Stock vs Sales by Category
                                        </h3>
                                        {stockVsSalesData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={280}>
                                                        <AreaChart data={stockVsSalesData}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                                                                <YAxis tick={{ fontSize: 12 }} />
                                                                <Tooltip
                                                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                />
                                                                <Legend />
                                                                <Area type="monotone" dataKey="stock" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Stock" />
                                                                <Area type="monotone" dataKey="sales" stackId="2" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} name="Sales" />
                                                        </AreaChart>
                                                </ResponsiveContainer>
                                        ) : (
                                                <div className="h-64 flex items-center justify-center text-gray-400">
                                                        No data available
                                                </div>
                                        )}
                                </div>

                                {/* Trending Products Pie */}
                                <div className="glass-card p-6 rounded-2xl">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                                <Flame className="w-5 h-5 text-orange-500" />
                                                Trending vs Regular Products
                                        </h3>
                                        {trendingData.some(d => d.value > 0) ? (
                                                <div className="flex items-center justify-center">
                                                        <ResponsiveContainer width="100%" height={280}>
                                                                <PieChart>
                                                                        <Pie
                                                                                data={trendingData}
                                                                                cx="50%"
                                                                                cy="50%"
                                                                                innerRadius={60}
                                                                                outerRadius={90}
                                                                                fill="#8884d8"
                                                                                paddingAngle={5}
                                                                                dataKey="value"
                                                                                label={({ name, value }) => `${name}: ${value}`}
                                                                        >
                                                                                {trendingData.map((entry, index) => (
                                                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                                                ))}
                                                                        </Pie>
                                                                        <Tooltip
                                                                                formatter={(value, name, props) => [
                                                                                        `${value} products (${props.payload.sales} sales)`,
                                                                                        name
                                                                                ]}
                                                                        />
                                                                        <Legend />
                                                                </PieChart>
                                                        </ResponsiveContainer>
                                                </div>
                                        ) : (
                                                <div className="h-64 flex items-center justify-center text-gray-400">
                                                        No trending data available
                                                </div>
                                        )}
                                </div>
                        </div>

                        {/* Low Stock Alert Table */}
                        <div className="glass-card p-6 rounded-2xl">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        Products Needing Attention
                                </h3>
                                <div className="overflow-x-auto">
                                        <table className="w-full">
                                                <thead className="bg-gray-50/50">
                                                        <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Stock</th>
                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Weekly Sales</th>
                                                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                                                        </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                        {products
                                                                .filter(p => p.stock <= 5)
                                                                .sort((a, b) => a.stock - b.stock)
                                                                .slice(0, 10)
                                                                .map(product => {
                                                                        const machine = machines.find(m => m.id === product.machineId);
                                                                        let statusColor = 'bg-yellow-100 text-yellow-700';
                                                                        let statusText = 'Low';
                                                                        if (product.stock === 0) {
                                                                                statusColor = 'bg-red-100 text-red-700';
                                                                                statusText = 'Out of Stock';
                                                                        } else if (product.stock <= 2) {
                                                                                statusColor = 'bg-orange-100 text-orange-700';
                                                                                statusText = 'Critical';
                                                                        }
                                                                        return (
                                                                                <tr key={product.id} className="hover:bg-gray-50/50">
                                                                                        <td className="px-4 py-3">
                                                                                                <p className="font-medium text-gray-800">{product.name}</p>
                                                                                                <p className="text-xs text-gray-500">{product.category || 'general'}</p>
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-center">
                                                                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${product.stock === 0 ? 'bg-red-100 text-red-600' :
                                                                                                        product.stock <= 2 ? 'bg-orange-100 text-orange-600' :
                                                                                                                'bg-yellow-100 text-yellow-600'
                                                                                                        }`}>
                                                                                                        {product.stock}
                                                                                                </span>
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-center font-semibold text-gray-700">
                                                                                                {product.salesData?.lastWeek || 0}
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-center">
                                                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                                                                                        {statusText}
                                                                                                </span>
                                                                                        </td>
                                                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                                                                {machine?.location || product.machineId}
                                                                                        </td>
                                                                                </tr>
                                                                        );
                                                                })}
                                                        {products.filter(p => p.stock <= 5).length === 0 && (
                                                                <tr>
                                                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                                                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                                                                All products have healthy stock levels!
                                                                        </td>
                                                                </tr>
                                                        )}
                                                </tbody>
                                        </table>
                                </div>
                        </div>
                </div>
        );
};

// Product Form Modal
const ProductFormModal = ({ isOpen, onClose, product, machines, onSave }) => {
        const [formData, setFormData] = useState({
                name: '',
                price: '',
                stock: '',
                machineId: '',
                category: 'snacks',
                imageUrl: '',
                description: '',
        });
        const [saving, setSaving] = useState(false);

        useEffect(() => {
                if (product) {
                        setFormData({
                                name: product.name || '',
                                price: product.price || '',
                                stock: product.stock || '',
                                machineId: product.machineId || '',
                                category: product.category || 'snacks',
                                imageUrl: product.imageUrl || '',
                                description: product.description || '',
                        });
                } else {
                        setFormData({
                                name: '',
                                price: '',
                                stock: '',
                                machineId: machines[0]?.id || '',
                                category: 'snacks',
                                imageUrl: '',
                                description: '',
                        });
                }
        }, [product, machines]);

        const handleSubmit = async (e) => {
                e.preventDefault();
                setSaving(true);

                try {
                        const data = {
                                name: formData.name,
                                price: Number(formData.price),
                                stock: Number(formData.stock),
                                machineId: formData.machineId,
                                category: formData.category,
                                imageUrl: formData.imageUrl,
                                description: formData.description,
                        };

                        if (product) {
                                await updateProduct(product.id, data);
                                toast.success('Product updated successfully');
                        } else {
                                await createProduct(data);
                                toast.success('Product created successfully');
                        }

                        onSave();
                        onClose();
                } catch (error) {
                        toast.error(error.message || 'Failed to save product');
                } finally {
                        setSaving(false);
                }
        };

        if (!isOpen) return null;

        const categories = ['beverages', 'snacks', 'chocolates', 'water', 'general'];

        return (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-4 border-b flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                                {product ? 'Edit Product' : 'Add New Product'}
                                        </h3>
                                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                                                <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                        <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Product Name *
                                                </label>
                                                <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                                                        placeholder="e.g., Coca Cola 500ml"
                                                />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Price (₹) *
                                                        </label>
                                                        <input
                                                                type="number"
                                                                required
                                                                min="0"
                                                                value={formData.price}
                                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                                                                placeholder="40"
                                                        />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Stock *
                                                        </label>
                                                        <input
                                                                type="number"
                                                                required
                                                                min="0"
                                                                value={formData.stock}
                                                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                                                                placeholder="20"
                                                        />
                                                </div>
                                        </div>

                                        <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Machine *
                                                </label>
                                                <select
                                                        required
                                                        value={formData.machineId}
                                                        onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                                                        disabled={!!product}
                                                >
                                                        <option value="">Select Machine</option>
                                                        {machines.map((m) => (
                                                                <option key={m.id} value={m.id}>
                                                                        {m.location} ({m.id})
                                                                </option>
                                                        ))}
                                                </select>
                                        </div>

                                        <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Category
                                                </label>
                                                <select
                                                        value={formData.category}
                                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                                                >
                                                        {categories.map((cat) => (
                                                                <option key={cat} value={cat}>
                                                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                                </option>
                                                        ))}
                                                </select>
                                        </div>

                                        <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Image URL
                                                </label>
                                                <input
                                                        type="url"
                                                        value={formData.imageUrl}
                                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                                                        placeholder="https://..."
                                                />
                                        </div>

                                        <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description
                                                </label>
                                                <textarea
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                                                        rows={2}
                                                        placeholder="Product description..."
                                                />
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                                <button
                                                        type="button"
                                                        onClick={onClose}
                                                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                                                >
                                                        Cancel
                                                </button>
                                                <button
                                                        type="submit"
                                                        disabled={saving}
                                                        className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium flex items-center justify-center gap-2"
                                                >
                                                        {saving ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                                <Save className="w-4 h-4" />
                                                        )}
                                                        {product ? 'Update' : 'Create'}
                                                </button>
                                        </div>
                                </form>
                        </div>
                </div>
        );
};

// Stock Edit Modal
const StockEditModal = ({ isOpen, onClose, product, onSave }) => {
        const [stock, setStock] = useState(product?.stock || 0);
        const [saving, setSaving] = useState(false);

        useEffect(() => {
                if (product) setStock(product.stock);
        }, [product]);

        const handleSave = async () => {
                setSaving(true);
                try {
                        await updateProductStock(product.id, Number(stock));
                        toast.success(`Stock updated to ${stock}`);
                        onSave();
                        onClose();
                } catch (error) {
                        toast.error('Failed to update stock');
                } finally {
                        setSaving(false);
                }
        };

        if (!isOpen || !product) return null;

        return (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Stock</h3>
                                <p className="text-sm text-gray-600 mb-4">{product.name}</p>

                                <div className="flex items-center gap-4 mb-6">
                                        <button
                                                onClick={() => setStock(Math.max(0, stock - 1))}
                                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                                        >
                                                −
                                        </button>
                                        <input
                                                type="number"
                                                min="0"
                                                value={stock}
                                                onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
                                                className="flex-1 text-center text-2xl font-bold px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                                        />
                                        <button
                                                onClick={() => setStock(stock + 1)}
                                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                                        >
                                                +
                                        </button>
                                </div>

                                <div className="flex gap-3">
                                        <button
                                                onClick={onClose}
                                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                                        >
                                                Cancel
                                        </button>
                                        <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium flex items-center justify-center gap-2"
                                        >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save
                                        </button>
                                </div>
                        </div>
                </div>
        );
};

// ============================================
// MAIN COMPONENT
// ============================================

const AdminDashboard = () => {
        // Use hooks for real-time data
        const { products, loading: productsLoading } = useAllProducts();
        const { machines, loading: machinesLoading } = useAllMachines();

        const [alerts, setAlerts] = useState([]);
        const [lowStockProducts, setLowStockProducts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);
        const [statusFilter, setStatusFilter] = useState('pending');
        const [activeTab, setActiveTab] = useState('products');
        const [threshold, setThreshold] = useState(3);
        const [selectedMachine, setSelectedMachine] = useState('');
        const [searchQuery, setSearchQuery] = useState('');

        // Modal states
        const [showProductForm, setShowProductForm] = useState(false);
        const [editingProduct, setEditingProduct] = useState(null);
        const [stockEditProduct, setStockEditProduct] = useState(null);

        // Fetch alerts
        const fetchAlerts = useCallback(async () => {
                try {
                        const response = await getStockAlerts(statusFilter === 'all' ? null : statusFilter);
                        setAlerts(response.data || []);
                } catch (error) {
                        console.error('Error fetching alerts:', error);
                }
        }, [statusFilter]);

        // Fetch low stock products
        const fetchLowStock = useCallback(async () => {
                try {
                        const response = await getLowStockProducts();
                        setLowStockProducts(response.data || []);
                        setThreshold(response.threshold || 3);
                } catch (error) {
                        console.error('Error fetching low stock:', error);
                }
        }, []);

        // Initial data fetch
        useEffect(() => {
                const loadData = async () => {
                        setLoading(true);
                        await Promise.all([fetchAlerts(), fetchLowStock()]);
                        setLoading(false);
                };
                loadData();
        }, [fetchAlerts, fetchLowStock]);

        // Refetch alerts when status filter changes
        useEffect(() => {
                fetchAlerts();
        }, [statusFilter, fetchAlerts]);

        // Refresh data
        const handleRefresh = async () => {
                setRefreshing(true);
                await Promise.all([fetchAlerts(), fetchLowStock()]);
                setRefreshing(false);
                toast.success('Data refreshed');
        };

        // Check all stock and create alerts
        const handleCheckAllStock = async () => {
                setRefreshing(true);
                try {
                        const response = await checkAllStock();
                        toast.success(response.message || `Created ${response.alertsCreated} new alerts`);
                        await fetchAlerts();
                } catch (error) {
                        toast.error('Failed to check stock');
                }
                setRefreshing(false);
        };

        // Acknowledge an alert
        const handleAcknowledge = async (alertId) => {
                try {
                        await acknowledgeAlert(alertId);
                        toast.success('Alert acknowledged');
                        await fetchAlerts();
                } catch (error) {
                        toast.error('Failed to acknowledge alert');
                }
        };

        // Resolve an alert
        const handleResolve = async (alertId) => {
                try {
                        await resolveAlert(alertId);
                        toast.success('Alert resolved');
                        await fetchAlerts();
                } catch (error) {
                        toast.error('Failed to resolve alert');
                }
        };

        // Delete product
        const handleDeleteProduct = async (product) => {
                if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                        return;
                }

                try {
                        await deleteProduct(product.id);
                        toast.success('Product deleted');
                        // Products will auto-update from Firestore listener
                } catch (error) {
                        toast.error('Failed to delete product');
                }
        };

        // Format timestamp
        const formatTime = (timestamp) => {
                if (!timestamp) return 'N/A';
                const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp._seconds * 1000);
                return date.toLocaleString();
        };

        // Filter products by search and machine
        const filteredProducts = products.filter(
                (p) => {
                        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                p.category?.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesMachine = !selectedMachine || selectedMachine === 'all' || p.machineId === selectedMachine;
                        return matchesSearch && matchesMachine;
                }
        );

        // Stats
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
        const lowStockCount = products.filter((p) => p.stock <= 3).length;
        const pendingAlerts = alerts.filter((a) => a.status === 'pending').length;
        const trendingCount = products.filter((p) => p.trending?.isTrending).length;
        const totalWeeklySales = products.reduce((sum, p) => sum + (p.salesData?.lastWeek || 0), 0);

        return (
                <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
                        {/* Header */}
                        <header className="glass-header sticky top-0 z-40 px-4 py-3 backdrop-blur-xl border-b border-white/30">
                                <div className="max-w-7xl mx-auto flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                                <Link
                                                        to="/"
                                                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                                                >
                                                        <ArrowLeft className="w-5 h-5" />
                                                        <span className="hidden sm:inline">Back</span>
                                                </Link>
                                                <div>
                                                        <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                                                Admin Dashboard
                                                        </h1>
                                                        <p className="text-xs sm:text-sm text-gray-500">Manage products & alerts</p>
                                                </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                                <button
                                                        onClick={handleRefresh}
                                                        disabled={refreshing}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 hover:bg-white/70 border border-white/40 transition-all"
                                                >
                                                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                                        <span className="hidden sm:inline">Refresh</span>
                                                </button>
                                        </div>
                                </div>
                        </header>

                        {/* Main Content */}
                        <main className="max-w-7xl mx-auto px-4 py-6">
                                {loading || productsLoading || machinesLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20">
                                                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                                                <p className="text-gray-500">Loading dashboard...</p>
                                        </div>
                                ) : (
                                        <>
                                                {/* Stats Cards */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                                        <div className="glass-card p-4 rounded-2xl">
                                                                <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                                                                <Package className="w-5 h-5 text-blue-600" />
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
                                                                                <p className="text-xs text-gray-500">Products</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className="glass-card p-4 rounded-2xl">
                                                                <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                                                                                <Boxes className="w-5 h-5 text-green-600" />
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-2xl font-bold text-gray-800">{totalStock}</p>
                                                                                <p className="text-xs text-gray-500">Total Stock</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className="glass-card p-4 rounded-2xl">
                                                                <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                                                                <Flame className="w-5 h-5 text-orange-600" />
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-2xl font-bold text-gray-800">{trendingCount}</p>
                                                                                <p className="text-xs text-gray-500">Trending</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className="glass-card p-4 rounded-2xl">
                                                                <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                                                                <BarChart3 className="w-5 h-5 text-purple-600" />
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-2xl font-bold text-gray-800">{totalWeeklySales}</p>
                                                                                <p className="text-xs text-gray-500">Weekly Sales</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className="glass-card p-4 rounded-2xl">
                                                                <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                                                                <PackageX className="w-5 h-5 text-yellow-600" />
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-2xl font-bold text-gray-800">{lowStockCount}</p>
                                                                                <p className="text-xs text-gray-500">Low Stock</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                        <div className="glass-card p-4 rounded-2xl">
                                                                <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                                                                <Bell className="w-5 h-5 text-red-600" />
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-2xl font-bold text-gray-800">{pendingAlerts}</p>
                                                                                <p className="text-xs text-gray-500">Alerts</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>

                                                {/* Tabs */}
                                                <div className="flex gap-2 mb-4 overflow-x-auto">
                                                        <button
                                                                onClick={() => setActiveTab('products')}
                                                                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'products'
                                                                        ? 'bg-indigo-500 text-white'
                                                                        : 'bg-white/50 text-gray-600 hover:bg-white/70'
                                                                        }`}
                                                        >
                                                                <span className="flex items-center gap-2">
                                                                        <Package className="w-4 h-4" />
                                                                        Products
                                                                </span>
                                                        </button>
                                                        <button
                                                                onClick={() => setActiveTab('alerts')}
                                                                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'alerts'
                                                                        ? 'bg-indigo-500 text-white'
                                                                        : 'bg-white/50 text-gray-600 hover:bg-white/70'
                                                                        }`}
                                                        >
                                                                <span className="flex items-center gap-2">
                                                                        <Bell className="w-4 h-4" />
                                                                        Alerts
                                                                        {pendingAlerts > 0 && (
                                                                                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                                                        {pendingAlerts}
                                                                                </span>
                                                                        )}
                                                                </span>
                                                        </button>
                                                        <button
                                                                onClick={() => setActiveTab('lowstock')}
                                                                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'lowstock'
                                                                        ? 'bg-indigo-500 text-white'
                                                                        : 'bg-white/50 text-gray-600 hover:bg-white/70'
                                                                        }`}
                                                        >
                                                                <span className="flex items-center gap-2">
                                                                        <PackageX className="w-4 h-4" />
                                                                        Low Stock
                                                                </span>
                                                        </button>
                                                        <button
                                                                onClick={() => setActiveTab('analytics')}
                                                                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === 'analytics'
                                                                        ? 'bg-indigo-500 text-white'
                                                                        : 'bg-white/50 text-gray-600 hover:bg-white/70'
                                                                        }`}
                                                        >
                                                                <span className="flex items-center gap-2">
                                                                        <PieChartIcon className="w-4 h-4" />
                                                                        Analytics
                                                                </span>
                                                        </button>
                                                </div>

                                                {/* Products Tab */}
                                                {activeTab === 'products' && (
                                                        <>
                                                                {/* Toolbar */}
                                                                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                                                        <div className="flex-1 relative">
                                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                                <input
                                                                                        type="text"
                                                                                        placeholder="Search products..."
                                                                                        value={searchQuery}
                                                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                                                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                                                />
                                                                        </div>
                                                                        <select
                                                                                value={selectedMachine}
                                                                                onChange={(e) => setSelectedMachine(e.target.value)}
                                                                                className="px-3 py-2 rounded-xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                                        >
                                                                                <option value="">All Machines</option>
                                                                                {machines.map((m) => (
                                                                                        <option key={m.id} value={m.id}>
                                                                                                {m.location}
                                                                                        </option>
                                                                                ))}
                                                                        </select>
                                                                        <button
                                                                                onClick={() => {
                                                                                        setEditingProduct(null);
                                                                                        setShowProductForm(true);
                                                                                }}
                                                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all"
                                                                        >
                                                                                <Plus className="w-4 h-4" />
                                                                                Add Product
                                                                        </button>
                                                                </div>

                                                                {/* Products Table */}
                                                                <div className="glass-card rounded-2xl overflow-hidden">
                                                                        <div className="overflow-x-auto">
                                                                                <table className="w-full">
                                                                                        <thead className="bg-gray-50/50">
                                                                                                <tr>
                                                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                                                                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Machine</th>
                                                                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Price</th>
                                                                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Stock</th>
                                                                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Weekly Sales</th>
                                                                                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Season</th>
                                                                                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                                                                                </tr>
                                                                                        </thead>
                                                                                        <tbody className="divide-y divide-gray-100">
                                                                                                {filteredProducts.length === 0 ? (
                                                                                                        <tr>
                                                                                                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                                                                                        No products found
                                                                                                                </td>
                                                                                                        </tr>
                                                                                                ) : (
                                                                                                        filteredProducts.map((product) => (
                                                                                                                <tr key={product.id} className="hover:bg-gray-50/50">
                                                                                                                        <td className="px-4 py-3">
                                                                                                                                <div className="flex items-center gap-3">
                                                                                                                                        <div className="relative">
                                                                                                                                                {product.imageUrl ? (
                                                                                                                                                        <img
                                                                                                                                                                src={product.imageUrl}
                                                                                                                                                                alt={product.name}
                                                                                                                                                                className="w-10 h-10 rounded-lg object-cover"
                                                                                                                                                        />
                                                                                                                                                ) : (
                                                                                                                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                                                                                                                <Package className="w-5 h-5 text-gray-400" />
                                                                                                                                                        </div>
                                                                                                                                                )}
                                                                                                                                                {product.trending?.isTrending && (
                                                                                                                                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                                                                                                                                                <Flame className="w-2.5 h-2.5 text-white" />
                                                                                                                                                        </span>
                                                                                                                                                )}
                                                                                                                                        </div>
                                                                                                                                        <div>
                                                                                                                                                <div className="flex items-center gap-2">
                                                                                                                                                        <p className="font-medium text-gray-800">{product.name}</p>
                                                                                                                                                        <TrendingBadge trending={product.trending} />
                                                                                                                                                </div>
                                                                                                                                                <p className="text-xs text-gray-500">
                                                                                                                                                        {product.trending?.reason || product.category || 'general'}
                                                                                                                                                </p>
                                                                                                                                        </div>
                                                                                                                                </div>
                                                                                                                        </td>
                                                                                                                        <td className="px-4 py-3">
                                                                                                                                <span className="text-sm text-gray-600">
                                                                                                                                        {machines.find((m) => m.id === product.machineId)?.location || product.machineId}
                                                                                                                                </span>
                                                                                                                        </td>
                                                                                                                        <td className="px-4 py-3 text-center">
                                                                                                                                <span className="font-semibold text-gray-800">₹{product.price}</span>
                                                                                                                        </td>
                                                                                                                        <td className="px-4 py-3">
                                                                                                                                <div className="flex justify-center">
                                                                                                                                        <button
                                                                                                                                                onClick={() => setStockEditProduct(product)}
                                                                                                                                                className="hover:scale-110 transition-transform"
                                                                                                                                                title="Click to edit stock"
                                                                                                                                        >
                                                                                                                                                <StockLevelIndicator stock={product.stock} />
                                                                                                                                        </button>
                                                                                                                                </div>
                                                                                                                        </td>
                                                                                                                        <td className="px-4 py-3">
                                                                                                                                <div className="flex justify-center">
                                                                                                                                        <SalesTrendIndicator salesData={product.salesData} />
                                                                                                                                </div>
                                                                                                                        </td>
                                                                                                                        <td className="px-4 py-3 text-center">
                                                                                                                                <SeasonBadge season={product.seasonalTag} />
                                                                                                                        </td>
                                                                                                                        <td className="px-4 py-3">
                                                                                                                                <div className="flex justify-end gap-2">
                                                                                                                                        <button
                                                                                                                                                onClick={() => {
                                                                                                                                                        setEditingProduct(product);
                                                                                                                                                        setShowProductForm(true);
                                                                                                                                                }}
                                                                                                                                                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                                                                                                                                title="Edit product"
                                                                                                                                        >
                                                                                                                                                <Edit2 className="w-4 h-4" />
                                                                                                                                        </button>
                                                                                                                                        <button
                                                                                                                                                onClick={() => handleDeleteProduct(product)}
                                                                                                                                                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                                                                                                                                title="Delete product"
                                                                                                                                        >
                                                                                                                                                <Trash2 className="w-4 h-4" />
                                                                                                                                        </button>
                                                                                                                                </div>
                                                                                                                        </td>
                                                                                                                </tr>
                                                                                                        ))
                                                                                                )}
                                                                                        </tbody>
                                                                                </table>
                                                                        </div>
                                                                </div>
                                                        </>
                                                )}

                                                {/* Alerts Tab */}
                                                {activeTab === 'alerts' && (
                                                        <>
                                                                <div className="flex items-center gap-2 mb-4">
                                                                        <Filter className="w-4 h-4 text-gray-400" />
                                                                        <select
                                                                                value={statusFilter}
                                                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                                                className="px-3 py-2 rounded-xl bg-white/50 border border-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                                                        >
                                                                                <option value="pending">Pending</option>
                                                                                <option value="acknowledged">Acknowledged</option>
                                                                                <option value="resolved">Resolved</option>
                                                                                <option value="all">All</option>
                                                                        </select>
                                                                        <button
                                                                                onClick={handleCheckAllStock}
                                                                                disabled={refreshing}
                                                                                className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-all"
                                                                        >
                                                                                <Bell className="w-4 h-4" />
                                                                                Scan Stock
                                                                        </button>
                                                                </div>

                                                                {alerts.length === 0 ? (
                                                                        <div className="glass-card p-8 rounded-2xl text-center">
                                                                                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                                                                <p className="text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} alerts</p>
                                                                        </div>
                                                                ) : (
                                                                        <div className="space-y-3">
                                                                                {alerts.map((alert) => (
                                                                                        <div key={alert.id} className="glass-card p-4 rounded-2xl">
                                                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                                                        <div className="flex items-start gap-4">
                                                                                                                <StockLevelIndicator stock={alert.currentStock} />
                                                                                                                <div>
                                                                                                                        <h3 className="font-semibold text-gray-800">{alert.productName}</h3>
                                                                                                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                                                                                                <MapPin className="w-3 h-3" />
                                                                                                                                <span>{alert.machineLocation}</span>
                                                                                                                        </div>
                                                                                                                        <div className="flex items-center gap-3 mt-2">
                                                                                                                                <StatusBadge status={alert.status} />
                                                                                                                                <span className="text-xs text-gray-400">{formatTime(alert.createdAt)}</span>
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                        <div className="flex gap-2 ml-12 sm:ml-0">
                                                                                                                {alert.status === 'pending' && (
                                                                                                                        <button
                                                                                                                                onClick={() => handleAcknowledge(alert.id)}
                                                                                                                                className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-sm font-medium"
                                                                                                                        >
                                                                                                                                Acknowledge
                                                                                                                        </button>
                                                                                                                )}
                                                                                                                {(alert.status === 'pending' || alert.status === 'acknowledged') && (
                                                                                                                        <button
                                                                                                                                onClick={() => handleResolve(alert.id)}
                                                                                                                                className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium"
                                                                                                                        >
                                                                                                                                Resolve
                                                                                                                        </button>
                                                                                                                )}
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                )}
                                                        </>
                                                )}

                                                {/* Low Stock Tab */}
                                                {activeTab === 'lowstock' && (
                                                        <>
                                                                <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200">
                                                                        <p className="text-sm text-orange-700">
                                                                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                                                                Products with stock ≤ <strong>{threshold}</strong> units
                                                                        </p>
                                                                </div>

                                                                {lowStockProducts.length === 0 ? (
                                                                        <div className="glass-card p-8 rounded-2xl text-center">
                                                                                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                                                                                <p className="text-gray-500">All products have sufficient stock!</p>
                                                                        </div>
                                                                ) : (
                                                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                                {lowStockProducts.map(({ product, machineLocation }) => (
                                                                                        <div key={product.id} className="glass-card p-4 rounded-2xl">
                                                                                                <div className="flex items-start gap-3">
                                                                                                        <StockLevelIndicator stock={product.stock} />
                                                                                                        <div className="flex-1 min-w-0">
                                                                                                                <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                                                                                                                <p className="text-sm text-gray-500">₹{product.price}</p>
                                                                                                                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                                                                                                        <MapPin className="w-3 h-3" />
                                                                                                                        <span className="truncate">{machineLocation}</span>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>
                                                                                                <button
                                                                                                        onClick={() => setStockEditProduct(product)}
                                                                                                        className="mt-3 w-full px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm font-medium"
                                                                                                >
                                                                                                        Update Stock
                                                                                                </button>
                                                                                        </div>
                                                                                ))}
                                                                        </div>
                                                                )}
                                                        </>
                                                )}

                                                {/* Analytics Tab */}
                                                {activeTab === 'analytics' && (
                                                        <AnalyticsDashboard
                                                                products={products}
                                                                machines={machines}
                                                                lowStockProducts={lowStockProducts}
                                                        />
                                                )}
                                        </>
                                )}
                        </main>

                        {/* Modals */}
                        <ProductFormModal
                                isOpen={showProductForm}
                                onClose={() => {
                                        setShowProductForm(false);
                                        setEditingProduct(null);
                                }}
                                product={editingProduct}
                                machines={machines}
                                onSave={() => {
                                        // Products auto-update from Firestore listener
                                        fetchLowStock();
                                }}
                        />

                        <StockEditModal
                                isOpen={!!stockEditProduct}
                                onClose={() => setStockEditProduct(null)}
                                product={stockEditProduct}
                                onSave={() => {
                                        // Products auto-update from Firestore listener
                                        fetchLowStock();
                                }}
                        />
                </div>
        );
};

export default AdminDashboard;
