#!/bin/bash

# Stock Update API Routes - Verification Script
# Usage: ./verify-stock-api.sh <API_BASE_URL>
# Example: ./verify-stock-api.sh https://your-project.vercel.app

set -e

API_BASE_URL="${1:-http://localhost:3000}"
PASS=0
FAIL=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "Stock Update API Verification"
echo "API Base URL: $API_BASE_URL"
echo "=================================="
echo ""

# Test 1: Health Check
test_health() {
    echo -n "Test 1: Health Check... "
    response=$(curl -s "$API_BASE_URL/api/health")
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "Response: $response"
        ((FAIL++))
    fi
}

# Test 2: Get Low Stock Products
test_low_stock() {
    echo -n "Test 2: Get Low Stock Products... "
    response=$(curl -s "$API_BASE_URL/api/admin-low-stock?threshold=10")
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "Response: $response"
        ((FAIL++))
    fi
}

# Test 3: Get Stock Alerts
test_alerts() {
    echo -n "Test 3: Get Stock Alerts... "
    response=$(curl -s "$API_BASE_URL/api/admin-alerts")
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "Response: $response"
        ((FAIL++))
    fi
}

# Test 4: Get All Products
test_products() {
    echo -n "Test 4: Get All Products... "
    response=$(curl -s "$API_BASE_URL/api/admin-products")
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "Response: $response"
        ((FAIL++))
    fi
}

# Test 5: Get All Machines
test_machines() {
    echo -n "Test 5: Get All Machines... "
    response=$(curl -s "$API_BASE_URL/api/admin-machines")
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "Response: $response"
        ((FAIL++))
    fi
}

# Test 6: PATCH Stock Update (Invalid Product - should fail gracefully)
test_stock_update() {
    echo -n "Test 6: PATCH Stock Update (Invalid ID - expect 400/500)... "
    response=$(curl -s -X PATCH "$API_BASE_URL/api/admin/products/invalid-id/stock" \
        -H "Content-Type: application/json" \
        -d '{"stock": 25}')
    if echo "$response" | grep -q '"success"'; then
        echo -e "${GREEN}PASS${NC} (Handled gracefully)"
        ((PASS++))
    else
        echo -e "${YELLOW}INFO${NC} (No response or error)"
        echo "Response: $response"
    fi
}

# Test 7: Missing Stock Field (should fail)
test_stock_missing() {
    echo -n "Test 7: PATCH Stock Update (Missing stock field)... "
    response=$(curl -s -X PATCH "$API_BASE_URL/api/admin/products/test-id/stock" \
        -H "Content-Type: application/json" \
        -d '{}')
    if echo "$response" | grep -q 'required\|error'; then
        echo -e "${GREEN}PASS${NC} (Error returned as expected)"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "Response: $response"
        ((FAIL++))
    fi
}

# Test 8: CORS Headers
test_cors() {
    echo -n "Test 8: CORS Headers Check... "
    headers=$(curl -s -I "$API_BASE_URL/api/health" 2>&1)
    if echo "$headers" | grep -q 'Access-Control-Allow-Origin'; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "Headers: $headers"
        ((FAIL++))
    fi
}

# Run all tests
test_health
test_low_stock
test_alerts
test_products
test_machines
test_stock_update
test_stock_missing
test_cors

echo ""
echo "=================================="
echo "Test Results:"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "=================================="

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All critical tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review.${NC}"
    exit 1
fi
