/**
 * Health Check Handler
 *
 * Simple endpoint to verify the API is running.
 * Used for monitoring and load balancer health checks.
 */

import { Request, Response } from 'express';

export const healthCheckHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'vending-machine-api',
    version: '1.0.0',
  });
};
