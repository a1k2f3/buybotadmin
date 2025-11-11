// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Store, ShoppingCart, DollarSign } from "lucide-react";

type Stats = {
  stores: number;
  users: number;
  pendingRequests: number;
  totalSales: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    stores: 0,
    users: 0,
    pendingRequests: 0,
    totalSales: 0,
  });

  useEffect(() => {
    // Replace with real API
    const mock = async () => ({
      stores: 142,
      users: 5_432,
      pendingRequests: 7,
      totalSales: 1_234_567,
    });
    mock().then(setStats);
  }, []);

  const items = [
    { title: "Stores", value: stats.stores, icon: Store, color: "text-blue-600" },
    { title: "Users", value: stats.users.toLocaleString(), icon: Users, color: "text-green-600" },
    { title: "Pending Requests", value: stats.pendingRequests, icon: ShoppingCart, color: "text-orange-600" },
    { title: "Total Sales", value: `$${stats.totalSales.toLocaleString()}`, icon: DollarSign, color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <Card key={i.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{i.title}</CardTitle>
              <i.className={`${i.color}`}>{<i.icon className="w-5 h-5" />}</i.icon>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{i.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for charts */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-gray-50">
          <p className="text-muted-foreground">Chart component (Chart.js / Recharts) goes here</p>
        </CardContent>
      </Card>
    </div>
  );
}