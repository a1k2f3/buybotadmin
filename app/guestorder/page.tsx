"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Eye, Copy, Loader2 } from "lucide-react";

interface GuestOrder {
  _id: string;
  guestInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    name: string;
    email: string;
    address: string;
    city: string;
    pincode: string;
    country: string;
  };
  items: Array<{
    title: string;
    image?: string;
    size?: string;
    quantity: number;
    price: number;
    storeId?: any;
  }>;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingToken: string;
  createdAt: string;
}

export default function GuestOrdersAdminPage() {
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<GuestOrder | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const fetchGuestOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/guest-orders`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch guest orders");

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load guest orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestOrders();
  }, []);

  const copyTrackingToken = (token: string) => {
    navigator.clipboard.writeText(token);
    alert("Tracking token copied!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 text-center">
        <p>Error: {error}</p>
        <button onClick={fetchGuestOrders} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Guest Orders</h1>
        <button
          onClick={fetchGuestOrders}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.guestInfo.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.guestInfo.email}<br />
                    {order.guestInfo.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Rs {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => copyTrackingToken(order.trackingToken)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Copy Tracking Token"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
              </div>
              <p className="text-sm text-gray-500 mt-1">ID: {selectedOrder._id}</p>
            </div>

            <div className="p-6 space-y-8">
              {/* Guest Info */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                  <div><strong>Name:</strong> {selectedOrder.guestInfo.name}</div>
                  <div><strong>Email:</strong> {selectedOrder.guestInfo.email}</div>
                  <div><strong>Phone:</strong> {selectedOrder.guestInfo.phone}</div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p>{selectedOrder.shippingAddress.name}</p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.pincode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Ordered Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border p-4 rounded-xl">
                      {item.image && (
                        <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × Rs{item.price}</p>
                      </div>
                      <div className="font-semibold">Rs{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex justify-between text-lg">
                  <span>Total Amount</span>
                  <span className="font-bold">Rs {selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between text-lg mt-2">
                  <span>Tracking Token</span>
                  <button onClick={() => copyTrackingToken(selectedOrder.trackingToken)} className="text-indigo-600 hover:underline flex items-center gap-1">
                    {selectedOrder.trackingToken} <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}