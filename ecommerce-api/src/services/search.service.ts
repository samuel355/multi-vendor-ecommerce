import { Client } from '@elastic/elasticsearch';
import { Pool } from 'pg';
import { getPool } from '../config/database';

export class SearchService {
  private elastic: Client;
  private pool: Pool;

  constructor() {
    this.initializeElastic();
    this.initializePool();
  }

  private async initializeElastic() {
    this.elastic = new Client({ node: process.env.ELASTICSEARCH_URL });
  }

  private async initializePool() {
    this.pool = await getPool();
  }

  async searchProducts(query: string, filters: {
    category?: string[];
    priceRange?: { min: number; max: number };
    rating?: number;
    vendor?: string;
  }) {
    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['name^3', 'description', 'brand', 'categories'],
          fuzziness: 'AUTO'
        }
      }
    ];

    if (filters.category?.length) {
      must.push({ terms: { categories: filters.category } });
    }

    if (filters.priceRange) {
      must.push({
        range: {
          price: {
            gte: filters.priceRange.min,
            lte: filters.priceRange.max
          }
        }
      });
    }

    if (filters.rating) {
      must.push({
        range: {
          average_rating: {
            gte: filters.rating
          }
        }
      });
    }

    if (filters.vendor) {
      must.push({ term: { vendor_id: filters.vendor } });
    }

    const result = await this.elastic.search({
      index: 'products',
      body: {
        query: {
          bool: { must }
        },
        aggs: {
          categories: {
            terms: { field: 'categories' }
          },
          price_ranges: {
            range: {
              field: 'price',
              ranges: [
                { to: 50 },
                { from: 50, to: 100 },
                { from: 100, to: 200 },
                { from: 200 }
              ]
            }
          },
          avg_rating: {
            avg: { field: 'average_rating' }
          }
        }
      }
    });

    return {
      hits: result.hits.hits,
      aggregations: result.aggregations
    };
  }

  async indexProduct(productId: string) {
    const query = `
      SELECT 
        p.*,
        v.business_name as vendor_name,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN product_reviews r ON p.id = r.product_id
      WHERE p.id = $1
      GROUP BY p.id, v.business_name
    `;

    const result = await this.pool.query(query, [productId]);
    const product = result.rows[0];

    await this.elastic.index({
      index: 'products',
      id: product.id,
      body: product
    });
  }
}

export default new SearchService();