'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Alert } from '@/components/ui/alert';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { PaginatedData } from '@/types/api';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  // Add other product properties
}

export default function ProductsPage() {
  const { loading, error, fetchProducts } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
   const [paginatedData, setPaginatedData] = useState<PaginatedData<Product> | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts({ page: 1, limit: 10 });
        setProducts(response.data.items);
        setPaginatedData(response.data);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };

    loadProducts();
  }, [fetchProducts]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-lg font-bold">${product.price}</p>
        </div>
      ))}
    </div>
  );
}