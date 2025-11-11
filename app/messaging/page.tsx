// app/admin/messaging/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MessagingPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const send = async (e: FormEvent) => {
    e.preventDefault();
    // await fetch("/api/admin/message", {method:"POST",body:JSON.stringify({to,subject,message})});
    alert(`Email sent to ${to}`);
    setTo(""); setSubject(""); setMessage("");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Send Message</h1>
      <form onSubmit={send} className="space-y-4">
        <div>
          <Label htmlFor="to">Recipient (email)</Label>
          <Input id="to" type="email" value={to} onChange={(e) => setTo(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="msg">Message</Label>
          <Textarea id="msg" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <Button type="submit">Send Email</Button>
      </form>
    </div>
  );
}