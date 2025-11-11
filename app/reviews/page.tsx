// app/admin/reviews/page.tsx
"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";

type Review = {
  id: number;
  store: string;
  user: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  status: "Approved" | "Pending" | "Spam";
  date: string;
};

const mockReviews: Review[] = [
  { id: 1, store: "TechHub", user: "Anna", rating: 5, text: "Great service!", status: "Approved", date: "2025-11-09" },
  { id: 2, store: "FashionPoint", user: "Karl", rating: 1, text: "Never delivered.", status: "Pending", date: "2025-11-10" },
  { id: 3, store: "TechHub", user: "Bot123", rating: 5, text: "BUY NOW!!!", status: "Spam", date: "2025-11-11" },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews);

  const moderate = (id: number, action: "approve" | "delete") => {
    if (action === "delete") {
      setReviews(prev => prev.filter(r => r.id !== id));
    } else {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" } : r));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Review Moderation</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.store}</TableCell>
              <TableCell>{r.user}</TableCell>
              <TableCell>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < r.rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">{r.text}</TableCell>
              <TableCell>
                <Badge variant={r.status === "Approved" ? "default" : r.status === "Pending" ? "secondary" : "destructive"}>
                  {r.status === "Spam" && <AlertCircle className="w-3 h-3 mr-1" />}
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell>{r.date}</TableCell>
              <TableCell className="text-right space-x-1">
                {r.status !== "Approved" && (
                  <Button size="sm" onClick={() => moderate(r.id, "approve")}>
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => moderate(r.id, "delete")}>
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}