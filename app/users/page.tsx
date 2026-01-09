"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Users } from "lucide-react";

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
  address?: string; // legacy field
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export default function UsersDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/users`);
        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }

        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Simple client-side search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search) ||
      (user.address && user.address.toLowerCase().includes(search.toLowerCase()))
  );

  const getDisplayAddress = (user: User): string => {
    // Prefer legacy address if it exists and is meaningful
    if (user.address && user.address !== "N/A") {
      return user.address;
    }

    // Otherwise use default address from addresses array
    const defaultAddr = user.addresses?.find((a) => a.isDefault);
    if (defaultAddr) {
      const parts = [
        defaultAddr.street,
        defaultAddr.apartment,
        defaultAddr.city,
        defaultAddr.state,
        defaultAddr.postalCode,
        defaultAddr.country,
      ].filter(Boolean);
      return parts.join(", ") || "No address provided";
    }

    // Last fallback: first address if any
    if (user.addresses?.length > 0) {
      const addr = user.addresses[0];
      const parts = [
        addr.street,
        addr.apartment,
        addr.city,
        addr.state,
        addr.postalCode,
        addr.country,
      ].filter(Boolean);
      return parts.join(", ") || "No address provided";
    }

    return "No address";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p className="text-lg font-medium">{error}</p>
        <p className="text-sm mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">
            Total registered users: {users.length}
          </p>
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found matching "{search}"
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {getDisplayAddress(user)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}