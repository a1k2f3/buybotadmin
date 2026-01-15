// app/admin/logs/page.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

// Mock data (replace with your real data source later)
const MOCK_LOGS = Array.from({ length: 87 }, (_, i) => ({
  id: 1000 - i,
  action: [
    "Approved",
    "Blocked",
    "Deleted",
    "Created",
    "Updated",
    "Logged in",
    "Password changed",
    "Role updated",
  ][Math.floor(Math.random() * 8)],
  user: [
    "ahmed.khan@example.com",
    "sara.ali@company.pk",
    "admin@system.com",
    "m.ali123@gmail.com",
    "zainab.raza@org.org",
  ][Math.floor(Math.random() * 5)],
  target: [
    "User #543",
    "Post #8921",
    "Comment #12453",
    "Listing #3094",
    "Category #18",
    "Profile update",
    "Product #672",
  ][Math.floor(Math.random() * 7)],
  timestamp: new Date(
    Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30 // last 30 days
  ),
}));

type Log = (typeof MOCK_LOGS)[number];

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const perPage = 10;

  const filteredLogs = useMemo(() => {
    if (filter === "all") return MOCK_LOGS;
    return MOCK_LOGS.filter(log =>
      log.action.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter]);

  const totalCount = filteredLogs.length;
  const totalPages = Math.ceil(totalCount / perPage);

  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredLogs.slice(start, start + perPage);
  }, [filteredLogs, page]);

  const formattedLogs = paginatedLogs.map(log => ({
    ...log,
    timestamp: log.timestamp.toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      dateStyle: "medium",
      timeStyle: "short",
    }),
  }));

  const handleExport = () => {
    if (formattedLogs.length === 0) {
      alert("No logs to export");
      return;
    }

    const headers = ["Time", "User", "Action", "Target"];
    const rows = formattedLogs.map(log => [
      `"${log.timestamp.replace(/"/g, '""')}"`,
      `"${log.user.replace(/"/g, '""')}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.target.replace(/"/g, '""')}"`,
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mock-logs_${new Date().toISOString().slice(0, 10)}_page${page}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/40 p-4 rounded-lg border">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: "all", label: "All Actions" },
              { value: "Approved", label: "Approved" },
              { value: "Blocked", label: "Blocked" },
              { value: "Deleted", label: "Deleted" },
              { value: "Created", label: "Created" },
              { value: "Updated", label: "Updated" },
            ].map(item => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleExport}
          disabled={formattedLogs.length === 0}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV (current page)
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedLogs.map(log => (
              <TableRow key={log.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{log.timestamp}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell className="text-muted-foreground">{log.target}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {formattedLogs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No activity logs found {filter !== "all" ? `for "${filter}" actions` : ""}.
        </div>
      )}

      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{formattedLogs.length}</strong> of{" "}
            <strong>{totalCount}</strong> logs • Page{" "}
            <strong>{page}</strong> of <strong>{totalPages}</strong>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}