import { Logger } from '../utils/logger';
import { format, subDays } from 'date-fns';

interface CoinmetricsResponse {
  data: {
    asset: string;
    time: string;
    CapMVRVCur: string;
  }[];
  next_page_url?: string;
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

  async getMVRVHistory(): Promise<{ times: string[], values: number[] }> {
    try {
      Logger.info('Fetching Bitcoin MVRV history from Coinmetrics');
      
      const endDate = new Date();
      const startDate = subDays(endDate, 180);
      
      let url = `${this.BASE_URL}/timeseries/asset-metrics?` + 
        `assets=btc&metrics=CapMVRVCur&` +
        `start_time=${format(startDate, 'yyyy-MM-dd')}&` +
        `end_time=${format(endDate, 'yyyy-MM-dd')}&pretty=true&page_size=180`;

      Logger.info('Requesting full history', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });

      let allData: { time: string; CapMVRVCur: string; }[] = [];
      
      // Fetch all pages
      while (url) {
        Logger.info('Requesting Coinmetrics data', { url });
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Coinmetrics API error: ${response.status} - ${errorText}`);
        }

        const data: CoinmetricsResponse = await response.json();
        allData = [...allData, ...data.data];
        
        // Get next page URL if it exists
        url = data.next_page_url || '';
        
        Logger.info('Received page of data', {
          newDataPoints: data.data.length,
          totalDataPoints: allData.length,
          hasMorePages: !!url
        });
      }

      Logger.info('Received all Coinmetrics history data', {
        totalDataPoints: allData.length,
        firstDate: allData[0]?.time,
        lastDate: allData[allData.length - 1]?.time
      });

      const result = {
        times: allData.map(d => d.time),
        values: allData.map(d => parseFloat(d.CapMVRVCur))
      };

      Logger.info('Processed MVRV history', {
        numberOfPoints: result.times.length,
        firstDate: result.times[0],
        lastDate: result.times[result.times.length - 1],
        daysCovered: Math.round((new Date(result.times[result.times.length - 1]).getTime() - 
                                new Date(result.times[0]).getTime()) / (1000 * 60 * 60 * 24))
      });

      return result;
    } catch (error) {
      Logger.error('Failed to fetch MVRV history', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
} 