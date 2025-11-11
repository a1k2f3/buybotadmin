// app/admin/logs/page.tsx
"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Log = {
  id: number;
  action: string;
  user: string;
  target: string;
  timestamp: string;
};

const allLogs: Log[] = [
  { id: 1, action: "Store Approved", user: "admin@buybot.com", target: "TechHub", timestamp: "2025-11-11 09:15" },
  { id: 2, action: "User Blocked", user: "admin@buybot.com", target: "karl@blocked.com", timestamp: "2025-11-10 14:30" },
  // ... 50 more
].flatMap((l, i) => Array(10).fill(l).map((x, j) => ({ ...x, id: i * 10 + j + 1 })));

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const perPage = 10;

  const filtered = filter === "all" ? allLogs : allLogs.filter(l => l.action.includes(filter));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Activity Logs</h1>

      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
            <SelectItem value="Deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map(log => (
            <TableRow key={log.id}>
              <TableCell>{log.timestamp}</TableCell>
              <TableCell>{log.user}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.target}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}