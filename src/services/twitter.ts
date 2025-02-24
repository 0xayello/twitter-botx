import { TwitterApi } from 'twitter-api-v2';
import { Logger } from '../utils/logger';

interface UsageData {
  [key: string]: number;
}

export class TwitterService {
  private client: TwitterApi;
  private static MONTHLY_LIMIT = 500;
  private static USAGE_KEY = 'twitter_api_usage';

  constructor() {
    // Check each environment variable
    const credentials = {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET
    };

    // Log the status of credentials (but not their values for security)
    Logger.info('Checking Twitter credentials', {
      apiKey: !!credentials.apiKey,
      apiSecret: !!credentials.apiSecret,
      accessToken: !!credentials.accessToken,
      accessSecret: !!credentials.accessSecret
    });

    if (!credentials.apiKey || 
        !credentials.apiSecret || 
        !credentials.accessToken || 
        !credentials.accessSecret) {
      throw new Error('Missing Twitter API credentials. Please check your .env file.');
    }

    // Initialize with OAuth 1.0a credentials
    this.client = new TwitterApi({
      appKey: credentials.apiKey,
      appSecret: credentials.apiSecret,
      accessToken: credentials.accessToken,
      accessSecret: credentials.accessSecret,
    });
  }

  private async incrementUsageCount(): Promise<number> {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // In a real app, this would be stored in a database
      // For now, we'll use localStorage if available, or memory if not
      let usage: UsageData = {};
      
      if (typeof localStorage !== 'undefined') {
        usage = JSON.parse(localStorage.getItem(TwitterService.USAGE_KEY) || '{}');
      }

      usage[month] = (usage[month] || 0) + 1;
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(TwitterService.USAGE_KEY, JSON.stringify(usage));
      }

      const currentUsage = usage[month];
      
      Logger.info('Twitter API usage updated', {
        month,
        currentUsage,
        remainingCalls: TwitterService.MONTHLY_LIMIT - currentUsage
      });

      return currentUsage;
    } catch (error) {
      Logger.warn('Failed to track API usage', { error });
      return 0;
    }
  }

  async postTweet(message: string): Promise<void> {
    try {
      Logger.info('Attempting to post tweet', { message });
      
      const usageCount = await this.incrementUsageCount();
      if (usageCount >= TwitterService.MONTHLY_LIMIT) {
        Logger.warn('Monthly API limit reached', { usageCount });
      }

      const response = await this.client.v2.tweet(message);
      
      if (!response?.data?.id) {
        throw new Error('Failed to get confirmation of tweet posting');
      }
      
      Logger.info('Successfully posted tweet', {
        tweetId: response.data.id
      });
    } catch (error) {
      // Add more detailed error logging
      const errorDetails = {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error,
        details: error instanceof Error && 'data' in error ? (error as any).data : undefined
      };
      
      Logger.error('Failed to post tweet', errorDetails);
      
      if (error instanceof Error) {
        throw new Error(
          `Twitter API Error: ${error.message}\n` +
          'Please verify your API keys and ensure your app has write permissions enabled.'
        );
      }
      
      throw error;
    }
  }
} 