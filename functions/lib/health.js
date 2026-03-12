"use strict";
/**
 * Health Check Handler
 *
 * Simple endpoint to verify the API is running.
 * Used for monitoring and load balancer health checks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckHandler = void 0;
const healthCheckHandler = async (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'vending-machine-api',
        version: '1.0.0',
    });
};
exports.healthCheckHandler = healthCheckHandler;
//# sourceMappingURL=health.js.map