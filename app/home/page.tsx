// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Store,
  ShoppingCart,
  DollarSign,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { exportToCSV } from "@/lib/exportToCSV";

type Stats = {
  stores: number;
  users: number;
  pendingRequests: number;
  totalSales: number;
};

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 19000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 25000 },
  { month: "May", revenue: 22000 },
  { month: "Jun", revenue: 30000 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    stores: 0,
    users: 0,
    pendingRequests: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Replace with real API
      const mock = {
        stores: 142,
        users: 5432,
        pendingRequests: 7,
        totalSales: 1234567,
      };
      setStats(mock);
      setLoading(false);
    };
    fetchData();
  }, []);

  const items = [
    {
      title: "Stores",
      value: stats.stores,
      icon: Store,
      color: "text-blue-600",
    },
    {
      title: "Users",
      value: stats.users.toLocaleString(),
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: ShoppingCart,
      color: "text-orange-600",
    },
    {
      title: "Total Sales",
      value: `$${stats.totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: "text-indigo-600",
    },
  ];

  const handleExport = () => {
    exportToCSV(
      [
        { metric: "Stores", value: stats.stores },
        { metric: "Users", value: stats.users },
        { metric: "Pending Requests", value: stats.pendingRequests },
        { metric: "Total Sales", value: stats.totalSales },
      ],
      "dashboard_summary"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Export */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Summary
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}