// app/admin/employees/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type Employee = { id: number; name: string; email: string; role: "Admin" | "Employee" };

export default function EmployeesPage() {
  const [list, setList] = useState<Employee[]>([]);
  const [form, setForm] = useState<{ name: string; email: string; password: string; role: "Admin" | "Employee" }>({ name: "", email: "", password: "", role: "Employee" });

  // Load
  useEffect(() => {
    (async () => {
      // const res = await fetch("/api/admin/employees");
      // const data = await res.json();
      const data: Employee[] = [
        { id: 1, name: "John Doe", email: "john@buybot.com", role: "Admin" },
        { id: 2, name: "Jane Smith", email: "jane@buybot.com", role: "Employee" },
      ];
      setList(data);
    })();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // await fetch("/api/admin/employees", { method: "POST", body: JSON.stringify(form) });
    const newEmp: Employee = {
      id: list.length + 1,
      name: form.name,
      email: form.email,
      role: form.role as "Admin" | "Employee",
    };
    setList((prev) => [...prev, newEmp]);
    setForm({ name: "", email: "", password: "", role: "Employee" });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Employee Management</h1>

      {/* Register Form */}
      <section className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" name="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as "Admin" | "Employee" }))}
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <Button type="submit">Register Employee</Button>
        </form>
      </section>

      {/* List */}
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                <TableCell>{e.name}</TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell>{e.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}