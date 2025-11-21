// app/admin/sales/page.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Order = { id: string; user: string; store: string; total: number; status: "Paid" | "Pending" | "Failed"; date: string };
type Cart = { id: string; user: string; items: number; value: number; lastActive: string };

const mockOrders: Order[] = [
  { id: "ORD-001", user: "Anna K", store: "TechHub", total: 299, status: "Paid", date: "2025-11-10" },
  { id: "ORD-002", user: "Karl L", store: "FashionPoint", total: 89, status: "Pending", date: "2025-11-11" },
];

const mockCarts: Cart[] = [
  { id: "CART-101", user: "Mara J", items: 3, value: 450, lastActive: "2 hours ago" },
];

export default function SalesPage() {
  const [storeFilter, setStoreFilter] = useState("all");

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
                <TableHead>Store</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map(o => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.user}</TableCell>
                  <TableCell>{o.store}</TableCell>
                  <TableCell>${o.total}</TableCell>
                  <TableCell>
                    <Badge variant={o.status === "Paid" ? "default" : o.status === "Pending" ? "secondary" : "destructive"}>
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{o.date}</TableCell>
                </TableRow>
              ))}
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
              {mockCarts.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.user}</TableCell>
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