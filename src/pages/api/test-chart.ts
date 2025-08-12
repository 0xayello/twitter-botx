import { NextApiRequest, NextApiResponse } from 'next';
import { ChartService } from '../../services/chart';
import { Logger } from '../../utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    Logger.info('Testing chart generation...');

    // Mock data for testing
    const mockData = {
      times: [
        '2024-01-01', '2024-01-15', '2024-02-01', '2024-02-15',
        '2024-03-01', '2024-03-15', '2024-04-01', '2024-04-15',
        '2024-05-01', '2024-05-15', '2024-06-01', '2024-06-15'
      ],
      values: [2.1, 2.3, 2.8, 3.1, 3.4, 3.2, 2.9, 2.7, 2.4, 2.1, 1.8, 1.9]
    };

    const chart = new ChartService();
    const chartImage = await chart.generateMVRVChart(mockData);

    Logger.info('Chart generated successfully');

    // Set headers for image response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', chartImage.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the image
    res.status(200).send(chartImage);

  } catch (error) {
    Logger.error('Failed to generate test chart', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    res.status(500).json({ 
      error: 'Failed to generate chart',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    });
  }
} 