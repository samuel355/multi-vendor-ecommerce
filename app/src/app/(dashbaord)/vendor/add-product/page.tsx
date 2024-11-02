import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const { loading, error, createProduct } = useApi();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = new FormData();
    productData.append('name', formData.name);
    productData.append('price', formData.price);
    productData.append('description', formData.description);
    if (formData.image) {
      productData.append('image', formData.image);
    }

    try {
      await createProduct(productData);
      router.push('/dashboard/vendor/products');
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Product Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            name: e.target.value
          }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Price
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            price: e.target.value
          }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            description: e.target.value
          }))}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Product Image
        </label>
        <input
          type="file"
          onChange={(e) => setFormData(prev => ({
            ...prev,
            image: e.target.files?.[0] || null
          }))}
          className="w-full p-2 border rounded"
          accept="image/*"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}