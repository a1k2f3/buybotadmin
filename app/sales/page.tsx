// app/admin/sales/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  thumbnail?: string;
};

type OrderItem = {
  size: any;
  productId: Product;
  storeId: {
    _id: string;
    storeName: string;
    address?: string;
    contactNumber?: string;
  };
  quantity: number;
  price: number;
  _id: string;
};

type Order = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: "Pending" | "Paid" | "Failed";
  status: string;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone?: string;
    address: string;
    city: string;
    pincode?: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
};

type DateFilter = "today" | "week" | "month" | "all";

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/all`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/update/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Update failed");

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);

    let filtered = orders;

    if (dateFilter === "today") filtered = orders.filter((o) => new Date(o.createdAt) >= today);
    else if (dateFilter === "week") filtered = orders.filter((o) => new Date(o.createdAt) >= weekAgo);
    else if (dateFilter === "month") filtered = orders.filter((o) => new Date(o.createdAt) >= monthAgo);

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredOrders(filtered);
  }, [orders, dateFilter]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Delivered":
      case "Paid":
        return "default";
      case "Processing":
      case "Shipped":
      case "Pending":
        return "secondary";
      case "Cancelled":
      case "Failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sales & Orders</h1>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="carts" disabled>Abandoned Carts</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex gap-4 items-center">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Store(s)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const storeNames = Array.from(
                      new Set(order.items.map((i) => i.storeId?.storeName).filter(Boolean))
                    ).join(", ");

                    return (
                      <Dialog key={order._id}>
                        <DialogTrigger asChild>
                          <TableRow
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <TableCell className="font-medium">#{order._id.slice(-8)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{order.userId?.name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">{order.userId?.email}</div>
                            </TableCell>
                            <TableCell>{storeNames || "N/A"}</TableCell>
                            <TableCell className="font-semibold">
                              RS{order.totalAmount.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getBadgeVariant(order.paymentStatus)}>
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status}
                                onValueChange={(v) => updateOrderStatus(order._id, v)}
                                disabled={updatingId === order._id}
                                onOpenChange={(open) => open && event?.stopPropagation()}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue>
                                    <Badge variant={getBadgeVariant(order.status)}>
                                      {updatingId === order._id && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                                      {order.status}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Processing">Processing</SelectItem>
                                  <SelectItem value="Shipped">Shipped</SelectItem>
                                  <SelectItem value="Delivered">Delivered</SelectItem>
                                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {format(new Date(order.createdAt), "MMM dd, yyyy")}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(order.createdAt), "h:mm a")}
                              </div>
                            </TableCell>
                          </TableRow>
                        </DialogTrigger>

                        {selectedOrder?._id === order._id && (
                          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - #{order._id.slice(-8)}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              <section>
                                <h3 className="font-semibold mb-2">Customer</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div><span className="text-muted-foreground">Name:</span> {order.userId.name}</div>
                                  <div><span className="text-muted-foreground">Email:</span> {order.userId.email}</div>
                                  <div><span className="text-muted-foreground">Phone:</span> {order.userId.phone || "N/A"}</div>
                                </div>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-2">Shipping Address</h3>
                                <div className="text-sm space-y-1">
                                  <div><strong>{order.shippingAddress.name}</strong></div>
                                  <div>{order.shippingAddress.address}</div>
                                  <div>{order.shippingAddress.city}, {order.shippingAddress.country}</div>
                                  {order.shippingAddress.pincode && <div>Pincode: {order.shippingAddress.pincode}</div>}
                                  {order.shippingAddress.phone && <div>Phone: {order.shippingAddress.phone}</div>}
                                </div>
                              </section>

                              <section>
                                <h3 className="font-semibold mb-3">Items ({order.items.length})</h3>
                                <div className="space-y-6">
                                  {order.items.map((item) => (
                                    <div key={item._id} className="border rounded-lg p-6 flex gap-6">
                                      {item.productId.thumbnail ? (
                                        <div className="flex-shrink-0">
                                          <Image
                                            src={item.productId.thumbnail}
                                            alt={item.productId.name}
                                            width={150}
                                            height={150}
                                            className="rounded-lg object-cover"
                                            onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                                          />
                                        </div>
                                      ) : (
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-36 h-36" />
                                      )}
                                      <div className="flex-1 space-y-3">
                                        <div className="font-semibold text-lg">{item.productId.name}</div>
                                        {item.productId.description && (
                                          <div className="text-sm text-muted-foreground whitespace-pre-line">
                                            {item.productId.description}
                                          </div>
                                        )}
                                        {item.size && (<div className="text-sm">Size: {item.size}</div>)  }
                                        <div className="text-sm">
                                          Quantity: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                                          <span className="ml-4 font-semibold">
                                            Subtotal: RS{(item.quantity * item.price).toLocaleString("en-IN")}
                                          </span>
                                        </div>
                                        <div className="pt-3 border-t">
                                          <div className="font-medium">Store: {item.storeId.storeName}</div>
                                          {item.storeId.address && <div className="text-sm text-muted-foreground">{item.storeId.address}</div>}
                                          {item.storeId.contactNumber && <div className="text-sm text-muted-foreground">Phone: {item.storeId.contactNumber}</div>}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              <section className="border-t pt-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div><span className="text-muted-foreground">Total Amount:</span> <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong></div>
                                  <div><span className="text-muted-foreground">Payment Method:</span> {order.paymentMethod}</div>
                                  <div><span className="text-muted-foreground">Payment Status:</span> 
                                    <Badge variant={getBadgeVariant(order.paymentStatus)} className="ml-2">{order.paymentStatus}</Badge>
                                  </div>
                                  <div><span className="text-muted-foreground">Order Status:</span> 
                                    <Badge variant={getBadgeVariant(order.status)} className="ml-2">{order.status}</Badge>
                                  </div>
                                  <div><span className="text-muted-foreground">Created:</span> {format(new Date(order.createdAt), "PPP p")}</div>
                                  <div><span className="text-muted-foreground">Updated:</span> {format(new Date(order.updatedAt), "PPP p")}</div>
                                </div>
                              </section>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}