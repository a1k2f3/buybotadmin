"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

interface Address {
  type: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  addresses: Address[];
  // orders and reviews are available but currently empty in the API
}

interface Order {
  id: string;
  user: User | null; // enriched with user details
  store: string;
  total: number;
  status: "Paid" | "Pending" | "Failed";
  date: string;
}

interface Cart {
  id: string;
  user: User | null;
  items: number;
  value: number;
  lastActive: string;
}

// For now, using mock data for carts since no dedicated carts endpoint is available
const mockCarts: Cart[] = [
  { id: "CART-101", user: null, items: 3, value: 450, lastActive: "2 hours ago" },
];

export default function SalesPage() {
  const [storeFilter, setStoreFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [carts] = useState<Cart[]>(mockCarts);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all users (includes addresses and other details)
        const usersRes = await fetch(`${API_BASE}/api/users`);
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const usersData: User[] = await usersRes.json();

        // Map users by ID for quick lookup
        const usersMap: Record<string, User> = {};
        usersData.forEach((u) => {
          usersMap[u._id] = u;
        });
        setUsers(usersMap);

        // Current /api/orders returns [] – replace with real endpoint when available
        // For demo, using mock orders and enriching with user data
        const mockOrdersFromAPI = [
          { id: "ORD-001", userId: "69345bc01e1b08ba2fd64f14", store: "TechHub", total: 299, status: "Paid" as const, date: "2025-11-10" },
          { id: "ORD-002", userId: "69345bc01e1b08ba2fd64f14", store: "FashionPoint", total: 89, status: "Pending" as const, date: "2025-11-11" },
        ];

        const enrichedOrders: Order[] = mockOrdersFromAPI.map((o) => ({
          id: o.id,
          user: usersMap[o.userId] || null,
          store: o.store,
          total: o.total,
          status: o.status,
          date: o.date,
        }));

        setOrders(enrichedOrders);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredOrders = orders.filter((o) =>
    storeFilter === "all" || o.store.toLowerCase().includes(storeFilter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-3 text-lg">Loading sales data...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sales & Orders</h1>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="carts">Abandoned Carts</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex gap-4">
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                <SelectItem value="techhub">TechHub</SelectItem>
                <SelectItem value="fashionpoint">FashionPoint</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="w-48" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email / Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => {
                const defaultAddr = o.user?.addresses.find((a) => a.isDefault) || o.user?.addresses[0];
                const addrStr = defaultAddr
                  ? `${defaultAddr.street}, ${defaultAddr.apartment ? `${defaultAddr.apartment}, ` : ""}${defaultAddr.city}, ${defaultAddr.state} ${defaultAddr.postalCode}, ${defaultAddr.country}`
                  : o.user?.address || "N/A";

                return (
                  <TableRow key={o.id}>
                    <TableCell>{o.id}</TableCell>
                    <TableCell>{o.user?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {o.user?.email && <div>{o.user.email}</div>}
                      {o.user?.phone && <div>{o.user.phone}</div>}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{addrStr}</TableCell>
                    <TableCell>{o.store}</TableCell>
                    <TableCell>${o.total}</TableCell>
                    <TableCell>
                      <Badge variant={o.status === "Paid" ? "default" : o.status === "Pending" ? "secondary" : "destructive"}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{o.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="carts">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cart ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.user?.name || "Guest"}</TableCell>
                  <TableCell>{c.items}</TableCell>
                  <TableCell>${c.value}</TableCell>
                  <TableCell>{c.lastActive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}