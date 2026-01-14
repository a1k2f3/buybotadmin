// src/pages/admin/DiscountManager.tsx
"use client";
import { useState, FormEvent } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DiscountManager = () => {
  const [percentage, setPercentage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'apply' | 'remove'>('apply');

  // Using environment variable for API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getAuthToken = (): string | null => localStorage.getItem('token');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!API_BASE_URL) {
      toast.error('API base URL is not configured. Please check your environment variables.');
      return;
    }

    if (actionType === 'apply') {
      const perc = Number(percentage);
      if (!perc || isNaN(perc) || perc < 0 || perc > 100) {
        toast.error('Please enter a valid discount percentage (0–100)');
        return;
      }
    } else {
      // remove confirmation
      if (!window.confirm('Remove discount price from ALL products?\nThis action cannot be undone.')) {
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint =
        actionType === 'apply'
          ? `${API_BASE_URL}/api/products/bulk-discount/apply`
          : `${API_BASE_URL}/api/products/bulk-discount/remove`;

      const body = actionType === 'apply' ? { discountPercentage: Number(percentage) } : {};

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        //   Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      toast.success(data.message || 'Operation completed successfully!');
      setPercentage(''); // reset after success
    } catch (err: unknown) {
      console.error('Discount operation error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Bulk Discount Manager</h1>

      <div className="bg-white shadow rounded-xl border border-gray-200 p-6 md:p-8">
        {/* Action type selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setActionType('apply')}
            className={`py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              actionType === 'apply'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Apply New Discount
          </button>

          <button
            type="button"
            onClick={() => setActionType('remove')}
            className={`py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              actionType === 'remove'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Remove All Discounts
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {actionType === 'apply' && (
            <div>
              <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="25"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  disabled={loading}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  %
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This will update discountPrice for all products (rounded to whole number)
              </p>
            </div>
          )}

          {actionType === 'remove' && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                This will set <strong>discountPrice</strong> to <code>null</code> for{' '}
                <strong>ALL products</strong>.
              </p>
              <p className="text-red-600 mt-1.5 text-sm">
                Make sure this is intentional — the action is irreversible.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (actionType === 'apply' && !percentage.trim())}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 ${
              actionType === 'apply'
                ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
            } disabled:opacity-60 disabled:cursor-not-allowed shadow-sm`}
          >
            {loading
              ? 'Processing...'
              : actionType === 'apply'
              ? `Apply ${percentage || ''}% Discount`
              : 'Remove Discount From All Products'}
          </button>
        </form>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default DiscountManager;