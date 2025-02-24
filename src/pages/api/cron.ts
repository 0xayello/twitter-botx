import { NextApiRequest, NextApiResponse } from 'next';
import { CoinGeckoService } from '../../services/coingecko';
import { SantimentService } from '../../services/santiment';
import { TwitterService } from '../../services/twitter';
import { Logger } from '../../utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify request method
    if (req.method !== 'POST') {
      Logger.warn('Invalid request method', { method: req.method });
      return res.status(405).json({ error: 'Method not allowed' });
    }

    Logger.info('Starting Bitcoin metrics update job');

    const coinGeckoService = new CoinGeckoService();
    const santimentService = new SantimentService();
    const twitterService = new TwitterService();

    // Get Bitcoin metrics
    const [bitcoinDominance, bitcoinMVRV] = await Promise.all([
      coinGeckoService.getBitcoinDominance(),
      santimentService.getBitcoinMVRV()
    ]);
    
    // Format the message in Portuguese with both metrics
    const message = `🔬 A dominância do Bitcoin hoje está em ${bitcoinDominance.toFixed(2)}%\n\n📊 O MVRV (Market Value to Realized Value) atual é ${bitcoinMVRV.toFixed(2)}`;

    // Post to Twitter
    await twitterService.postTweet(message);

    Logger.info('Successfully completed Bitcoin metrics update');
    res.status(200).json({ 
      success: true, 
      bitcoinDominance,
      bitcoinMVRV 
    });
  } catch (error) {
    Logger.error('Failed to process Bitcoin metrics update', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 