"use client";

import { useState } from "react";
import { useLiveData } from "@/hooks/use-live-data";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Globe, Palette, School } from "lucide-react";
import type { Settings as SettingsType } from "@/types";

export default function SettingsPage() {
  const { settings, refreshData } = useLiveData();
  const [formData, setFormData] = useState<SettingsType | any>(
    settings || {
      id: "default",
      schoolName: "",
      academicYear: new Date().getFullYear().toString(),
      currency: "INR",
      dateFormat: "MM/dd/yyyy",
      language: "en",
      theme: "light",
      timezone: "UTC",
      invoicePrefix: "INV",
      invoiceNumberStart: 1000,
      paymentMethods: ["Cash", "Check", "Bank Transfer", "Online"],
      feeCategories: [
        "Tuition",
        "Books",
        "Lab Fee",
        "Transport",
        "Exam Fee",
        "Other",
      ],
      gradeOptions: [
        "K-1",
        "K-2",
        "1st",
        "2nd",
        "3rd",
        "4th",
        "5th",
        "6th",
        "7th",
        "8th",
        "9th",
        "10th",
        "11th",
        "12th",
      ],
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [newFeeCategory, setNewFeeCategory] = useState("");
  const [newGradeOption, setNewGradeOption] = useState("");

  const handleInputChange = (field: keyof SettingsType | any, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange("logo", reader.result as string); // Save as base64
    };
    reader.readAsDataURL(file);
  };

  const handleAddPaymentMethod = () => {
    if (
      newPaymentMethod.trim() &&
      !formData.paymentMethods.includes(newPaymentMethod.trim())
    ) {
      handleInputChange("paymentMethods", [
        ...formData.paymentMethods,
        newPaymentMethod.trim(),
      ]);
      setNewPaymentMethod("");
    }
  };

  const handleAddFeeCategory = () => {
    if (
      newFeeCategory.trim() &&
      !formData.feeCategories.includes(newFeeCategory.trim())
    ) {
      handleInputChange("feeCategories", [
        ...formData.feeCategories,
        newFeeCategory.trim(),
      ]);
      setNewFeeCategory("");
    }
  };
  const handleGradeOption = () => {
    if (
      newGradeOption.trim() &&
      !formData.gradeOptions.includes(newGradeOption.trim())
    ) {
      handleInputChange("gradeOptions", [
        ...formData.gradeOptions,
        newGradeOption.trim(),
      ]);
      setNewGradeOption("");
    } else {
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      storage.setSettings(formData);
      refreshData();
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences and options
          </p>
        </div>
        <Button
          className="hover:cursor-pointer"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Localization
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-start gap-2">
                <Label>School Logo</Label>
                {settings?.logo && (
                  <img
                    src={settings?.logo}
                    alt="School Logo"
                    className="h-20 w-20 object-contain border rounded"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) =>
                    handleInputChange("schoolName", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) =>
                    handleInputChange("academicYear", e.target.value)
                  }
                  placeholder="2024-2025"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={formData.invoicePrefix}
                  onChange={(e) =>
                    handleInputChange("invoicePrefix", e.target.value)
                  }
                  placeholder="INV"
                />
              </div>
              <div>
                <Label htmlFor="invoiceNumberStart">
                  Starting Invoice Number
                </Label>
                <Input
                  id="invoiceNumberStart"
                  type="number"
                  value={formData.invoiceNumberStart}
                  onChange={(e) =>
                    handleInputChange(
                      "invoiceNumberStart",
                      Number.parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    handleInputChange("language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={formData.dateFormat}
                  onValueChange={(value) =>
                    handleInputChange("dateFormat", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/dd/yyyy">MM/dd/yyyy (US)</SelectItem>
                    <SelectItem value="dd/MM/yyyy">dd/MM/yyyy (UK)</SelectItem>
                    <SelectItem value="yyyy-MM-dd">yyyy-MM-dd (ISO)</SelectItem>
                    <SelectItem value="dd.MM.yyyy">
                      dd.MM.yyyy (German)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) =>
                    handleInputChange("timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time
                    </SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={formData.theme}
                  onValueChange={(value) => handleInputChange("theme", value)}
                >
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
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new payment method"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  onKeyUp={(e) =>
                    e.key === "Enter" && handleAddPaymentMethod()
                  }
                />
                <Button
                  onClick={handleAddPaymentMethod}
                  disabled={!newPaymentMethod.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.paymentMethods.map((method: any, index: any) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span>{method}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newMethods = formData.paymentMethods.filter(
                          (_: any, i: any) => i !== index
                        );
                        handleInputChange("paymentMethods", newMethods);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fee Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new fee category"
                  value={newFeeCategory}
                  onChange={(e) => setNewFeeCategory(e.target.value)}
                  onKeyUp={(e) =>
                    e.key === "Enter" && handleAddFeeCategory()
                  }
                />
                <Button
                  onClick={handleAddFeeCategory}
                  disabled={!newFeeCategory.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.feeCategories.map((category: any, index: any) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span>{category}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newCategories = formData.feeCategories.filter(
                          (_: any, i: any) => i !== index
                        );
                        handleInputChange("feeCategories", newCategories);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new fee category"
                  value={newGradeOption}
                  onChange={(e) => setNewGradeOption(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && handleGradeOption()}
                />
                <Button
                  onClick={handleGradeOption}
                  disabled={!newGradeOption.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.gradeOptions.map((category: any, index: any) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span>{category}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newCategories = formData.gradeOptions.filter(
                          (_: any, i: any) => i !== index
                        );
                        handleInputChange("gradeOptions", newCategories);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
