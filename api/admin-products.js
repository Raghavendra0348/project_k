/**
 * Wrapper for admin products endpoint
 * This file acts as the serverless function that Vercel will recognize
 */

const adminProducts = require('./admin/products');

module.exports = adminProducts;
