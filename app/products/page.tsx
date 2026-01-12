"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Tag {
  name: string;
  slug: string;
  color?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  thumbnail: string;
  category?: { name: string; slug: string } | null;
  tags: Tag[];
  images: { url: string; public_id: string; _id: string }[];
}

export default function RandomProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const PRODUCTS_PER_PAGE = 12; // ← you can change this

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: PRODUCTS_PER_PAGE.toString(),
          // sort: 'createdAt:-1',     // optional
          // fields: 'name,price,thumbnail,category,tags,images', // optional
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products?${query.toString()}`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await res.json();

        setProducts(data?.data || []);
        setTotalProducts(data?.total || 0);
        setTotalPages(data?.pages || Math.ceil((data?.total || 0) / PRODUCTS_PER_PAGE) || 1);

      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]); // Re-fetch when page changes

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Optional: scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Simple pagination numbers logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Ellipsis before middle pages
    if (currentPage > 3) {
      pages.push('...');
    }

    // Middle pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ellipsis after middle pages
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Random Products</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              <div className="p-3">
                <h2 className="text-base font-semibold line-clamp-2 min-h-[2.5rem] mb-1">
                  {product.name}
                </h2>
                <p className="text-lg font-bold text-indigo-700 mb-2">
                  PKR {product.price.toLocaleString()}
                </p>

                {product.category?.name && (
                  <p className="text-xs text-gray-500 mb-2">
                    {product.category.name}
                  </p>
                )}

                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.map((tag) => (
                      <span
                        key={tag.slug || tag.name}
                        className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {product.images?.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {product.images.slice(0, 3).map((img) => (
                      <div key={img._id} className="relative aspect-square">
                        <Image
                          src={img.url}
                          alt=""
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No products */}
        {products.length === 0 && !loading && (
          <p className="text-center text-gray-500 text-xl mt-16">No products found.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {products.length} of {totalProducts} products
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`
                    px-3 py-2 rounded-md text-sm min-w-[2.5rem]
                    ${
                      page === currentPage
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-white border hover:bg-gray-50'
                    }
                    ${page === '...' ? 'cursor-default' : ''}
                  `}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}