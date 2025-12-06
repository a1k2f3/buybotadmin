"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface Tag { // Define a Tag interface based on the likely object keys
  name: string;
  slug: string;
  // Assuming 'color' is also part of the object based on the error
  color?: string; 
}

interface Product {
  _id: string;
  name: string;
  price: number;
  thumbnail: string;
  // Updated to allow category to be optional or nullable
  category?: { 
    name: string;
    slug: string;
  } | null;
  // UPDATE: Change tags from string[] to Tag[] to match the likely API change
  tags: Tag[]; 
  images: {
    url: string;
    public_id: string;
    _id: string;
  }[];
}

export default function RandomProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/random`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2"> {/* Reduced vertical padding and horizontal padding */}
      <div className="max-w-7xl mx-auto"> {/* Increased max width for more columns */}
        <h1 className="text-3xl font-bold text-center mb-8">Random Products</h1> {/* Reduced font size */}
        
        {/* UPDATED GRID: Added more columns (lg:grid-cols-4) to make cards smaller */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> 
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md p-4"> {/* Reduced padding and shadow */}
              
              {/* UPDATED IMAGE HEIGHT: Reduced height from h-64 to h-48 */}
              <div className="relative h-48 w-full mb-3"> 
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              
              <h2 className="text-lg font-semibold truncate mb-1">{product.name}</h2> {/* Reduced font size and added truncate */}
              <p className="text-base font-bold text-indigo-600 mb-1">PKR {product.price.toLocaleString()}</p> {/* Reduced font size */}
              
              {/* Category Display (kept safe check) */}
              {product.category && product.category.name && (
                <p className="text-xs text-gray-500 mb-2"> {/* Reduced font size */}
                  Category: <span className="font-medium">{product.category.name}</span>
                </p>
              )}
              
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2"> {/* Reduced gap and margin */}
                  {product.tags.map((tag) => (
                    // FIX: Ensure tag has a key and a name property, and check for existence
                    <span 
                      key={tag.slug || tag.name} // Use slug or name as key
                      className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded-full text-xs"
                    >
                      {tag.name} 
                    </span>
                  ))}
                </div>
              )}
              
              {/* Small image grid (kept small) */}
              <div className="grid grid-cols-2 gap-1">
                {product.images.slice(0, 2).map((img) => ( // Limiting to two images for small card
                  <div key={img._id} className="relative h-16 w-full"> {/* Reduced height */}
                    <Image
                      src={img.url}
                      alt="Product image"
                      fill
                      className="object-cover rounded-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && <p className="text-center text-gray-500 mt-8">No products found.</p>}
      </div>
    </div>
  );
}