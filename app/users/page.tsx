// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, UserX, UserCheck } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Blocked";
  orders: number;
  spent: number;
  joined: string;
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 });

  useEffect(() => {
    const all: User[] = [
      { id: 1, name: "Anna K", email: "anna@example.com", status: "Active", orders: 12, spent: 1240, joined: "2024-01-15" },
      { id: 2, name: "Karl L", email: "karl@blocked.com", status: "Blocked", orders: 3, spent: 89, joined: "2024-03-20" },
      // ... more
    ].filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search));

    setUsers(all);
    setStats({
      total: all.length,
      active: all.filter(u => u.status === "Active").length,
      blocked: all.filter(u => u.status === "Blocked").length,
    });
  }, [search]);

  const toggleBlock = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" } : u));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <UserX className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.blocked}</div></CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Spent</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Badge variant={u.status === "Active" ? "default" : "destructive"}>{u.status}</Badge>
              </TableCell>
              <TableCell>{u.orders}</TableCell>
              <TableCell>${u.spent}</TableCell>
              <TableCell>{u.joined}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={u.status === "Active" ? "destructive" : "outline"}
                  onClick={() => toggleBlock(u.id)}
                >
                  {u.status === "Active" ? "Block" : "Unblock"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}