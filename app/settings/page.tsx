"use client";

import { useState, useEffect } from "react";
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
import { Settings as SettingsIcon, Globe, Palette, School } from "lucide-react";
import type { Settings } from "@/types";

export default function SettingsPage() {
  const { settings, refreshData } = useLiveData();
  const [formData, setFormData] = useState<Settings | any>({
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
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [newFeeCategory, setNewFeeCategory] = useState("");
  const [newGradeOption, setNewGradeOption] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync form data with settings from local storage
  useEffect(() => {
    if (settings) {
      // Merge settings with defaults to ensure all fields are present
      const defaults = {
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
      };
      setFormData({ ...defaults, ...settings });
    }
  }, [settings]);

  const handleInputChange = (field: keyof Settings | any, value: any) => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("logo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
            <SettingsIcon className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-start gap-4">
                <Label>School Logo</Label>
                
                {/* Logo Preview */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div 
                      className={`h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        isDragOver 
                          ? 'border-blue-400 bg-blue-50 scale-105' 
                          : formData.logo 
                            ? 'border-gray-300 bg-gray-50 hover:bg-gray-100' 
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      {formData.logo ? (
                        <img
                          src={formData.logo}
                          alt="School Logo"
                          className="h-20 w-20 object-contain rounded"
                        />
                      ) : (
                        <div className="text-center">
                          <div className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-blue-400' : 'text-gray-400'}`}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className={`text-xs ${isDragOver ? 'text-blue-600' : 'text-gray-500'}`}>
                            {isDragOver ? 'Drop here' : 'No logo'}
                          </p>
                        </div>
                      )}
                    </div>
                    {formData.logo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputChange("logo", "");
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      {formData.logo ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500">
                      Click to browse or drag & drop • Recommended: 200x200px, PNG or JPG
                    </p>
                  </div>
                </div>
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
