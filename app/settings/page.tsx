// app/admin/settings/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Settings, Save, Globe, Mail, Shield, Moon, Sun } from "lucide-react";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
  emailNotifications: z.boolean(),
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.enum(["15", "30", "60", "never"]),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "BuyBot",
      currency: "USD",
      timezone: "Europe/Riga",
      emailNotifications: true,
      twoFactorAuth: false,
      sessionTimeout: "30",
    },
  });

  const onSubmit = async (data: SettingsForm) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Settings saved:", data);
    setIsSaving(false);
    // Show toast in real app
  };

  const watched2FA = watch("twoFactorAuth");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your admin panel preferences</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              General
            </CardTitle>
            <CardDescription>Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                {...register("siteName")}
                placeholder="BuyBot Admin"
              />
              {errors.siteName && (
                <p className="text-sm text-destructive">{errors.siteName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  onValueChange={(value) => setValue("currency", value)}
                  defaultValue={watch("currency")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="LVL">LVL (Legacy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  onValueChange={(value) => setValue("timezone", value)}
                  defaultValue={watch("timezone")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Riga">Europe/Riga (EET)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">New York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Email alert preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for new stores, reviews, and critical events
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={watch("emailNotifications")}
                onCheckedChange={(checked) => setValue("emailNotifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Protect your admin account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch
                id="twoFactorAuth"
                checked={watched2FA}
                onCheckedChange={(checked) => setValue("twoFactorAuth", checked)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Session Timeout</Label>
              <Select
                onValueChange={(value) => setValue("sessionTimeout", value as any)}
                defaultValue={watch("sessionTimeout")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize how the admin panel looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}