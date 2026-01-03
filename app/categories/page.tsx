"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: {
    url: string;
  };
  productCount: number;
  children: Category[];
  parentCategory?: {
    _id: string;
    name: string;
    slug: string;
    id: string;
  } | null;
  description?: string;
}

function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>();
  categories.forEach(cat => {
    categoryMap.set(cat._id, { ...cat, children: [] });
  });

  const tree: Category[] = [];

  categories.forEach(cat => {
    if (cat.parentCategory) {
      const parent = categoryMap.get(cat.parentCategory._id);
      if (parent) {
        const child = categoryMap.get(cat._id);
        if (child) {
          parent.children.push(child);
        }
      }
    } else {
      const catItem = categoryMap.get(cat._id);
      if (catItem) {
        tree.push(catItem);
      }
    }
  });

  // Optional: Sort top-level categories by name
  tree.sort((a, b) => a.name.localeCompare(b.name));

  // Optional: Sort children recursively
  const sortChildren = (cat: Category) => {
    cat.children.sort((a, b) => a.name.localeCompare(b.name));
    cat.children.forEach(sortChildren);
  };
  tree.forEach(sortChildren);

  return tree;
}

function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const json = await response.json();
        if (json.success) {
          const nestedCategories = buildCategoryTree(json.data);
          setCategories(nestedCategories);
        } else {
          throw new Error('API response was not successful');
        }
      } catch (err: unknown) {
        let message = 'An unknown error occurred';
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="flex flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Categories</h1>
        <Link href="/categories/add">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200">
            Add Categories
          </button>
        </Link>
      </div>
      <div style={styles.grid}>
        {categories.map((category) => (
          <div key={category._id} style={styles.card}>
            <img
              src={category.image.url}
              alt={category.name}
              style={styles.image}
            />
            <div style={styles.cardContent}>
              <h2 style={styles.cardTitle}>{category.name}</h2>
              <p style={styles.cardSlug}>Slug: {category.slug}</p>
              <p style={styles.cardCount}>Products: {category.productCount}</p>
              {category.description && (
                <p style={styles.cardDescription}>{category.description}</p>
              )}
              {category.children.length > 0 ? (
                <div style={styles.children}>
                  <h3 style={styles.childrenTitle}>Subcategories:</h3>
                  <ul style={styles.childrenList}>
                    {category.children.map((child) => (
                      <li key={child._id} style={styles.childItem}>
                        {child.name} (Products: {child.productCount})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={styles.noChildren}>No subcategories</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    transition: 'transform 0.2s',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '15px',
  },
  cardTitle: {
    fontSize: '1.2em',
    marginBottom: '10px',
    color: '#007bff',
  },
  cardSlug: {
    fontSize: '0.9em',
    color: '#666',
    marginBottom: '5px',
  },
  cardCount: {
    fontSize: '0.9em',
    color: '#666',
    marginBottom: '10px',
  },
  cardDescription: {
    fontSize: '0.9em',
    color: '#555',
    marginBottom: '10px',
  },
  children: {
    marginTop: '10px',
  },
  childrenTitle: {
    fontSize: '1em',
    marginBottom: '5px',
    color: '#333',
  },
  childrenList: {
    listStyleType: 'disc',
    paddingLeft: '20px',
  },
  childItem: {
    fontSize: '0.9em',
    color: '#555',
  },
  noChildren: {
    fontSize: '0.9em',
    color: '#888',
    fontStyle: 'italic',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2em',
    color: '#666',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2em',
    color: 'red',
  },
};

export default Page;