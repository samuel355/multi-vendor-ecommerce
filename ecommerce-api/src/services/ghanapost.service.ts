import axios from 'axios';
import { cache } from '../config/redis';
import logger from '../config/logger';

export class GhanaPostService {
  private readonly API_KEY = process.env.GHANAPOST_API_KEY;
  private readonly API_URL = 'https://api.ghanapostgps.com/v1';

  async validateDigitalAddress(digitalAddress: string) {
    try {
      const response = await axios.post(`${this.API_URL}/validate`, {
        digital_address: digitalAddress,
        api_key: this.API_KEY
      });

      return response.data;
    } catch (error) {
      logger.error('GhanaPost validation error:', error);
      throw error;
    }
  }

  async getCoordinates(digitalAddress: string) {
    const cacheKey = `coords:${digitalAddress}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) return JSON.parse(cached);

    try {
      const response = await axios.post(`${this.API_URL}/coordinates`, {
        digital_address: digitalAddress,
        api_key: this.API_KEY
      });

      const coordinates = {
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        region: response.data.region,
        district: response.data.district
      };

      await cache.set(cacheKey, JSON.stringify(coordinates), 86400); // Cache for 24 hours
      return coordinates;
    } catch (error) {
      logger.error('GhanaPost coordinates error:', error);
      throw error;
    }
  }
}

export default new GhanaPostService();