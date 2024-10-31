import axios from 'axios';
import { cache } from '../config/redis';
import logger from '../config/logger';
import ApiError from '../utils/apiError';

interface GhanaGPSResponse {
  status: number;
  message: string;
  data?: {
    Table: {
      Region: string;
      District: string;
      Area: string;
      Street: string;
      PostCode: string;
      latitude: number;
      longitude: number;
    }[];
  };
}

export class LocationService {
  private readonly GHANA_GPS_API_KEY = process.env.GHANA_GPS_API_KEY;
  private readonly CACHE_TTL = 86400; // 24 hours

  private readonly GHANA_REGIONS = [
    'Greater Accra',
    'Ashanti',
    'Central',
    'Eastern',
    'Northern',
    'Western',
    'Volta',
    'Brong Ahafo',
    'Upper East',
    'Upper West'
  ];

  async validateDigitalAddress(digitalAddress: string): Promise<boolean> {
    // Basic format validation
    const addressPattern = /^[A-Z]{2}-\d{3,4}-\d{4}$/;
    if (!addressPattern.test(digitalAddress)) {
      return false;
    }

    // Region code validation
    const regionCode = digitalAddress.substring(0, 2);
    const validRegionCodes = {
      'GA': 'Greater Accra',
      'AK': 'Ashanti',
      'CP': 'Central',
      'EP': 'Eastern',
      'NP': 'Northern',
      'WP': 'Western',
      'VP': 'Volta',
      'BA': 'Brong Ahafo',
      'UE': 'Upper East',
      'UW': 'Upper West'
    };

    return Object.keys(validRegionCodes).includes(regionCode);
  }

  async convertDigitalAddress(digitalAddress: string) {
    const cacheKey = `location:${digitalAddress}`;
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Validate address format
      if (!(await this.validateDigitalAddress(digitalAddress))) {
        throw ApiError.badRequest('Invalid digital address format');
      }

      // Call Ghana GPS API
      const response = await axios.get<GhanaGPSResponse>(
        'https://api.ghanapostgps.com/v1/address',
        {
          params: {
            digital_address: digitalAddress,
            api_key: this.GHANA_GPS_API_KEY
          },
          timeout: 5000 // 5 seconds timeout
        }
      );

      if (!response.data.data?.Table?.length) {
        throw ApiError.notFound('Digital address not found');
      }

      const locationData = response.data.data.Table[0];
      const result = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        region: locationData.Region,
        district: locationData.District,
        area: locationData.Area,
        street: locationData.Street,
        postCode: locationData.PostCode
      };

      // Cache the result
      await cache.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Ghana GPS API error:', error.response?.data);
        throw ApiError.badRequest('Error validating digital address');
      }
      throw error;
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  async getRegionBounds(region: string): Promise<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }> {
    // Ghana region boundaries (approximate)
    const regionBounds: Record<string, any> = {
      'Greater Accra': {
        minLat: 5.4478,
        maxLat: 5.9279,
        minLng: -0.3974,
        maxLng: 0.2321
      },
      'Ashanti': {
        minLat: 5.8862,
        maxLat: 7.6194,
        minLng: -2.3386,
        maxLng: -0.7898
      },
      // Add other regions as needed
    };

    if (!regionBounds[region]) {
      throw ApiError.badRequest('Invalid region');
    }

    return regionBounds[region];
  }
}

export default new LocationService();