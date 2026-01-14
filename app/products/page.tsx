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
  discountPrice?: number | null;
  thumbnail: string;
  category?: { name: string; slug: string } | null;
  tags: Tag[];
  images: { url: string; public_id: string; _id: string }[];
}

export default function RandomProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states – must be declared BEFORE useEffect
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const PRODUCTS_PER_PAGE = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: PRODUCTS_PER_PAGE.toString(),
          // Optional: make sure your backend returns discountPrice
          // fields: 'name,price,discountPrice,thumbnail,category,tags,images',
        });

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products?${query.toString()}`
        );

        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();

        setProducts(data?.data || []);
        setTotalProducts(data?.total || 0);
        setTotalPages(
          data?.pages || Math.ceil((data?.total || 0) / PRODUCTS_PER_PAGE) || 1
        );
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

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
        <h1 className="text-3xl font-bold text-center mb-8">Explore Products</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const hasDiscount =
              product.discountPrice != null &&
              product.discountPrice > 0 &&
              product.discountPrice < product.price;

            const discountPercentage = hasDiscount
              ? Math.round(
                  ((product.price - (product.discountPrice ?? 0)) / product.price) * 100
                )
              : 0;

            return (
              <Link
                href={`/products/${product._id}`}
                key={product._id}
                className="group bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative h-48 w-full bg-gray-100">
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      {discountPercentage}% OFF
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-base font-semibold line-clamp-2 min-h-[2.8rem] mb-2 group-hover:text-indigo-700 transition-colors">
                    {product.name}
                  </h2>

                  {/* Price with discount */}
                  <div className="mt-auto">
                    {hasDiscount ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xl font-bold text-red-600">
                          PKR {(product.discountPrice ?? 0).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          PKR {product.price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-indigo-700">
                        PKR {product.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {product.category?.name && (
                    <p className="text-xs text-gray-500 mt-2">{product.category.name}</p>
                  )}

                  {product.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.slug || tag.name}
                          className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="text-xs text-gray-500 self-center">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

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
                className="px-5 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Previous
              </button>

              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                  className={`
                    px-4 py-2 rounded-md text-sm min-w-[2.6rem] font-medium
                    ${page === currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'}
                    ${page === '...' ? 'cursor-default bg-transparent border-none' : ''}
                  `}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
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