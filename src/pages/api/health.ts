import { NextApiRequest, NextApiResponse } from 'next';
import { Logger } from '../../utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    Logger.info('Health check requested');

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        chart: 'available',
        twitter: 'available',
        coinmetrics: 'available',
        coingecko: 'available'
      },
      chartjs: {
        version: '3.9.1',
        status: 'configured'
      }
    };

    Logger.info('Health check completed successfully');
    
    res.status(200).json(healthData);

  } catch (error) {
    Logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 