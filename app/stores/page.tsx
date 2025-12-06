// app/admin/stores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { exportToCSV } from "@/lib/exportToCSV";
import Link from "next/link";
import { Store } from "lucide-react";

interface Store {
  _id: string;
  name: string;
  ownerName: string;
  email: string;
  contactNumber: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logo: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    website: string;
  };
  documents: {
    otherDocs: any[];
  };
  isVerified: boolean;
  verificationStatus: string;
  status: "Active" | "Pending" | "Suspended" | "Blocked";
  products: string[];
  orders: any[];
  rating: number;
  totalReviews: number;
  walletBalance: number;
  pendingPayments: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function StoresPage() {
  const [search, setSearch] = useState("");
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/store-requests`)
      .then((res) => res.json())
      .then((data) => setAllStores(data))
      .catch((error) => console.error("Failed to fetch stores:", error));
  }, []);

  useEffect(() => {
    const filtered = allStores.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    setStores(filtered);
  }, [search, allStores]);

  const action = async (id: string, act: "accept" | "suspend" | "block" | "delete") => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stores/${id}/${act}`, { method: "POST" });
      setAllStores((prev) =>
        prev.map((s) =>
          s._id === id
            ? {
                ...s,
                status:
                  act === "accept"
                    ? "Active"
                    : (act.charAt(0).toUpperCase() + act.slice(1)) as any,
              }
            : s
        )
      );
    } catch (error) {
      console.error("Failed to perform action:", error);
    }
  };

  const handleExport = () => {
    if (stores.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["ID", "Name", "Status", "Wallet Balance", "Reviews"];
    const rows = stores.map((s) => [
      s._id,
      s.name,
      s.status,
      s.walletBalance,
      s.totalReviews,
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Store Management</h1>

      <Input
        placeholder="Search stores..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Button onClick={handleExport} variant="outline">
        Export CSV
      </Button>
      <Link href="/stores/rigester">
        <Button variant="outline" className="gap-2">
          <Store className="w-4 h-4" />
          Register Store
        </Button>
      </Link>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Wallet Balance</TableHead>
            <TableHead>Reviews</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((s) => (
            <TableRow key={s._id}>
              <TableCell>{s._id}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    s.status === "Active"
                      ? "default"
                      : s.status === "Pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {s.status}
                </Badge>
              </TableCell>
              <TableCell>${s.walletBalance.toLocaleString()}</TableCell>
              <TableCell>{s.totalReviews}</TableCell>
              <TableCell className="flex justify-end gap-1">
                {s.status === "Pending" && (
                  <Button size="sm" onClick={() => action(s._id, "accept")}>
                    Accept
                  </Button>
                )}
                {s.status === "Active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => action(s._id, "suspend")}
                  >
                    Suspend
                  </Button>
                )}
                {["Active", "Suspended"].includes(s.status) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => action(s._id, "block")}
                  >
                    Block
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => action(s._id, "delete")}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}