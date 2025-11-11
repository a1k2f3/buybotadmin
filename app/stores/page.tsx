// app/admin/stores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Store = {
  id: number;
  name: string;
  status: "Active" | "Pending" | "Suspended" | "Blocked";
  sales: number;
  reviews: number;
};

export default function StoresPage() {
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    // mock + simple client-side filter
    const all: Store[] = [
      { id: 1, name: "TechHub", status: "Active", sales: 12500, reviews: 84 },
      { id: 2, name: "FashionPoint", status: "Pending", sales: 0, reviews: 0 },
      { id: 3, name: "GadgetZone", status: "Suspended", sales: 3200, reviews: 12 },
    ];
    const filtered = all.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    setStores(filtered);
  }, [search]);

  const action = async (id: number, act: "accept" | "suspend" | "block" | "delete") => {
    // await fetch(`/api/admin/stores/${id}/${act}`, {method: "POST"});
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, status: act === "accept" ? "Active" : (act.charAt(0).toUpperCase() + act.slice(1)) as any } : s)));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Store Management</h1>

      <Input placeholder="Search stores..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sales</TableHead>
            <TableHead>Reviews</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.id}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>
                <Badge variant={s.status === "Active" ? "default" : s.status === "Pending" ? "secondary" : "destructive"}>
                  {s.status}
                </Badge>
              </TableCell>
              <TableCell>${s.sales.toLocaleString()}</TableCell>
              <TableCell>{s.reviews}</TableCell>
              <TableCell className="flex justify-end gap-1">
                {s.status === "Pending" && <Button size="sm" onClick={() => action(s.id, "accept")}>Accept</Button>}
                {s.status === "Active" && <Button size="sm" variant="outline" onClick={() => action(s.id, "suspend")}>Suspend</Button>}
                {["Active", "Suspended"].includes(s.status) && <Button size="sm" variant="destructive" onClick={() => action(s.id, "block")}>Block</Button>}
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => action(s.id, "delete")}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}