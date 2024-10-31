import axios, { AxiosError } from 'axios';
import { cache } from '../config/redis';
import logger from '../config/logger';
import ApiError from '../utils/apiError';

interface GPGPSResponse {
  found: boolean;
  data?: {
    Table: Array<{
      Area: string;
      CenterLatitude: number;
      CenterLongitude: number;
      District: string;
      GPSName: string;
      PostCode: string;
      Region: string;
      Street: string;
    }>;
  };
  error?: string;
}

export class GhanaPostService {
  private readonly API_URL = 'https://api.ghanapostgps.com/v2/PublicGPGPSAPI.aspx';

  async getAddressDetails(digitalAddress: string) {
    const cacheKey = `address:${digitalAddress}`;
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Make direct API request with provided credentials
      const response = await axios<GPGPSResponse>({
        method: 'POST',
        url: this.API_URL,
        headers: {
          'Authorization': 'QW5kcm9pZEtleTpTV3RsYm01aFFGWnZhMkZqYjIwMFZRPT0=',
          'Content-Type': 'application/json'
        },
        data: {
          AsaaseUser: 'SWtlbm5hQFZva2Fjb200VQ==',
          LanguageCode: 'en',
          Language: 'English',
          GPSName: digitalAddress
        }
      });

      logger.info('GhanaPost API Response:', response.data);

      if (response.data && response.data.found) {
        await cache.set(cacheKey, JSON.stringify(response.data), 86400);
        return response.data;
      }

      return null;
    } catch (err) {
      const error = err as AxiosError;
      logger.error('GhanaPost error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        throw new ApiError(401, 'Invalid credentials for GhanaPost GPS');
      }
      
      throw new ApiError(500, 'Error fetching address details');
    }
  }

  async testConnection() {
    try {
      const response = await axios<GPGPSResponse>({
        method: 'POST',
        url: this.API_URL,
        headers: {
          'Authorization': 'QW5kcm9pZEtleTpTV3RsYm01aFFGWnZhMkZqYjIwMFZRPT0=',
          'Content-Type': 'application/json'
        },
        data: {
          AsaaseUser: 'SWtlbm5hQFZva2Fjb200VQ==',
          LanguageCode: 'en',
          Language: 'English',
          GPSName: 'GA-492-1834'
        }
      });

      logger.info('Test connection response:', response.data);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      logger.error('Test connection error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      throw new ApiError(
        500, 'Error occured'
      );
    }
  }

  // Helper method to validate digital address format
  private validateAddressFormat(address: string): boolean {
    // Basic validation for Ghana GPS format (you may need to adjust this)
    const gpsRegex = /^[A-Z]{2}[-]?\d{3}[-]?\d{4}$/;
    return gpsRegex.test(address);
  }

  // Public method to validate address before making API call
  async validateAddress(address: string): Promise<{ 
    isValid: boolean; 
    message?: string;
  }> {
    // First check format
    if (!this.validateAddressFormat(address)) {
      return {
        isValid: false,
        message: 'Invalid GPS address format. Expected format: XX-000-0000'
      };
    }

    try {
      const details = await this.getAddressDetails(address);
      return {
        isValid: !!details,
        message: details ? 'Address found' : 'Address not found'
      };
    } catch (error) {
      return {
        isValid: false,
        message: 'Error validating address'
      };
    }
  }
}

// Create and export instance
const ghanaPostService = new GhanaPostService();
export default ghanaPostService;