import { Logger } from '../utils/logger';

interface CoinmetricsResponse {
  data: {
    asset: string;
    time: string;
    CapMVRVCur: string;
  }[];
}

export class CoinmetricsService {
  private readonly BASE_URL = 'https://community-api.coinmetrics.io/v4';

  async getBitcoinMVRV(): Promise<number> {
    try {
      Logger.info('Fetching Bitcoin MVRV from Coinmetrics');
      
      // Get yesterday's date in YYYY-MM-DD format
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startTime = yesterday.toISOString().split('T')[0];
      
      // Using CapMVRVCur as the correct metric name for MVRV ratio
      const response = await fetch(
        `${this.BASE_URL}/timeseries/asset-metrics?` + 
        `assets=btc&metrics=CapMVRVCur&start_time=${startTime}&pretty=true`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Coinmetrics API error: ${response.status} - ${errorText}`);
      }

      const data: CoinmetricsResponse = await response.json();
      
      Logger.info('Coinmetrics raw response', { data });

      if (!data.data?.[0]?.CapMVRVCur) {
        throw new Error('No MVRV value received');
      }

      // Parse the MVRV string to number
      const mvrv = parseFloat(data.data[0].CapMVRVCur);

      Logger.info('Successfully fetched Bitcoin MVRV', {
        mvrv,
        time: data.data[0].time
      });
      
      return mvrv;
    } catch (error) {
      Logger.error('Failed to fetch Bitcoin MVRV', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      throw error;
    }
  }
} 