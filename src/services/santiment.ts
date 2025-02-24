import { Logger } from '../utils/logger';

interface SantimentResponse {
  data: {
    getMetric: {
      timeseriesData: {
        value: number;
        datetime: string;
      }[];
    };
  };
  errors?: Array<{
    message: string;
    path: string[];
  }>;
}

export class SantimentService {
  private readonly BASE_URL = 'https://api.santiment.net/graphql';
  private readonly API_KEY: string;

  constructor() {
    const apiKey = process.env.SANTIMENT_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Santiment API key');
    }
    this.API_KEY = apiKey;
  }

  async getBitcoinMVRV(): Promise<number> {
    try {
      Logger.info('Fetching Bitcoin MVRV from Santiment');
      
      // Use the exact dates that the API allows
      const from = '2024-02-25T19:36:41.207Z';  // Current day
      const to = '2025-01-25T19:36:41.207Z';    // Future date allowed by API
      
      const query = `{
        getMetric(metric: "mvrv_usd") {
          timeseriesData(
            slug: "bitcoin"
            from: "${from}"
            to: "${to}"
            includeIncompleteData: true
          ) {
            value
            datetime
          }
        }
      }`;

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Apikey ${this.API_KEY}`
        },
        body: JSON.stringify({ query })
      });
      
      Logger.info('Santiment API response', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Santiment API error: ${response.status} - ${errorText}`);
      }

      const data: SantimentResponse = await response.json();
      
      // Check for API errors
      if (data.errors) {
        throw new Error(`Santiment API error: ${data.errors[0].message}`);
      }

      Logger.info('Santiment raw response', { data });

      const timeseriesData = data.data.getMetric.timeseriesData;
      if (!timeseriesData || timeseriesData.length === 0) {
        throw new Error('No MVRV data received');
      }

      // Find the most recent non-null value
      const latestData = timeseriesData
        .reverse()
        .find(d => d && d.value !== null);

      if (!latestData?.value) {
        throw new Error('No valid MVRV value found in the response');
      }

      const mvrv = latestData.value;

      Logger.info('Successfully fetched Bitcoin MVRV', {
        mvrv,
        datetime: latestData.datetime
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