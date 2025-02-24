import { CoinGeckoService } from '../services/coingecko';
import { CoinmetricsService } from '../services/coinmetrics';
import { TwitterService } from '../services/twitter';
import { Logger } from '../utils/logger';

function getMVRVClassification(mvrv: number): string {
  if (mvrv >= 3.5) return "alarmante";
  if (mvrv >= 3.0) return "alto";
  if (mvrv >= 1.0) return "neutro";
  return "zona de compra";
}

async function test() {
  try {
    Logger.info('Starting test...');

    // Test CoinGecko and Coinmetrics
    const coinGecko = new CoinGeckoService();
    const coinmetrics = new CoinmetricsService();
    
    const [dominance, mvrv] = await Promise.all([
      coinGecko.getBitcoinDominance(),
      coinmetrics.getBitcoinMVRV()
    ]);
    
    if (typeof dominance !== 'number' || isNaN(dominance)) {
      throw new Error('Invalid dominance value received');
    }
    
    if (typeof mvrv !== 'number' || isNaN(mvrv)) {
      throw new Error('Invalid MVRV value received');
    }
    
    Logger.info('Data fetch successful', { dominance, mvrv });

    // Test Twitter
    Logger.info('Initializing Twitter service...');
    const twitter = new TwitterService();
    
    const mvrvClassification = getMVRVClassification(mvrv);
    const message = `📊 O MVRV (Market Value to Realized Value) atual é ${mvrv.toFixed(2)} - ${mvrvClassification}\n\n🔬 A dominância do Bitcoin hoje está em ${dominance.toFixed(2)}%`;
    
    Logger.info('Attempting to post tweet...', { message });
    
    await twitter.postTweet(message);
    Logger.info('Twitter test successful');

  } catch (error) {
    Logger.error('Test failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    // Exit with error code
    process.exit(1);
  }
}

test(); 