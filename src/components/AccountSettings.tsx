"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  User,
  Settings,
  Bell,
  CreditCard,
  Shield,
  Key,
  Download,
  Trash2,
  Mail,
  Phone,
  Building,
  MapPin,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Camera,
  Edit3,
  Save,
  X
} from "lucide-react";
import { useAuth, hasPermission } from "@/lib/auth-context";

interface NotificationPreferences {
  email: {
    priceAlerts: boolean;
    bidUpdates: boolean;
    contractNotifications: boolean;
    marketInsights: boolean;
    systemUpdates: boolean;
    weeklyReports: boolean;
  };
  sms: {
    urgentAlerts: boolean;
    bidWins: boolean;
    contractDeadlines: boolean;
  };
  browser: {
    realTimeUpdates: boolean;
    priceChanges: boolean;
    newOpportunities: boolean;
  };
  frequency: "immediate" | "hourly" | "daily" | "weekly";
}

interface BillingInfo {
  plan: "starter" | "professional" | "enterprise" | "grid_operator";
  billingCycle: "monthly" | "annual";
  nextBilling: Date;
  usage: {
    trades: number;
    apiCalls: number;
    dataStorage: number; // GB
    maxTrades: number;
    maxApiCalls: number;
    maxStorage: number;
  };
  paymentMethod: {
    type: "credit_card" | "bank_transfer" | "crypto";
    last4: string;
    expiryDate: string;
  };
  invoices: Array<{
    id: string;
    date: Date;
    amount: number;
    status: "paid" | "pending" | "overdue";
    downloadUrl: string;
  }>;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  apiKeys: Array<{
    id: string;
    name: string;
    key: string;
    permissions: string[];
    lastUsed: Date;
    created: Date;
  }>;
  loginHistory: Array<{
    date: Date;
    location: string;
    ip: string;
    device: string;
    success: boolean;
  }>;
}

export function AccountSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    company: user?.company || "",
    jobTitle: "Energy Trading Manager",
    address: "123 Energy St, San Francisco, CA 94105",
    website: "https://company.com",
    timezone: "America/Los_Angeles",
    language: "en-US",
    avatar: user?.avatar || ""
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: {
      priceAlerts: true,
      bidUpdates: true,
      contractNotifications: true,
      marketInsights: false,
      systemUpdates: true,
      weeklyReports: true
    },
    sms: {
      urgentAlerts: true,
      bidWins: true,
      contractDeadlines: true
    },
    browser: {
      realTimeUpdates: true,
      priceChanges: true,
      newOpportunities: false
    },
    frequency: "immediate"
  });

  // Billing state
  const [billing, setBilling] = useState<BillingInfo>({
    plan: user?.tier === "premium" ? "professional" : user?.tier === "enterprise" ? "enterprise" : "starter",
    billingCycle: "monthly",
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usage: {
      trades: 156,
      apiCalls: 8420,
      dataStorage: 2.4,
      maxTrades: user?.tier === "enterprise" ? 10000 : user?.tier === "premium" ? 1000 : 100,
      maxApiCalls: user?.tier === "enterprise" ? 100000 : user?.tier === "premium" ? 10000 : 1000,
      maxStorage: user?.tier === "enterprise" ? 100 : user?.tier === "premium" ? 10 : 1
    },
    paymentMethod: {
      type: "credit_card",
      last4: "4567",
      expiryDate: "12/26"
    },
    invoices: [
      {
        id: "INV-2024-001",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        amount: 299,
        status: "paid",
        downloadUrl: "#"
      },
      {
        id: "INV-2024-002",
        date: new Date(),
        amount: 299,
        status: "pending",
        downloadUrl: "#"
      }
    ]
  });

  // Security state
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    apiKeys: [
      {
        id: "key-1",
        name: "Production API",
        key: "eb_live_sk_1234567890abcdef",
        permissions: ["read:energy_data", "write:bids"],
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    ],
    loginHistory: [
      {
        date: new Date(),
        location: "San Francisco, CA",
        ip: "192.168.1.100",
        device: "Chrome on macOS",
        success: true
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        location: "San Francisco, CA",
        ip: "192.168.1.100",
        device: "Safari on iPhone",
        success: true
      }
    ]
  });

  const handleSaveProfile = () => {
    // Save profile changes
    setIsEditing(false);
    console.log("Profile saved:", profile);
  };

  const handleNotificationChange = (category: keyof NotificationPreferences, setting: string, value: boolean | string) => {
    setNotifications(prev => ({
      ...prev,
      [category]: typeof prev[category] === 'object' ? {
        ...prev[category],
        [setting]: value
      } : value
    }));
  };

  const handleGenerateApiKey = () => {
    const newKey = {
      id: `key-${Date.now()}`,
      name: "New API Key",
      key: `eb_live_sk_${Math.random().toString(36).substring(2, 15)}`,
      permissions: ["read:energy_data"],
      lastUsed: new Date(),
      created: new Date()
    };
    setSecurity(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, newKey]
    }));
  };

  const handleDeleteApiKey = (keyId: string) => {
    setSecurity(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter(key => key.id !== keyId)
    }));
  };

  const getPlanFeatures = (plan: string) => {
    const features = {
      starter: ["100 trades/month", "1,000 API calls", "1GB storage", "Email support"],
      professional: ["1,000 trades/month", "10,000 API calls", "10GB storage", "Priority support", "Advanced analytics"],
      enterprise: ["Unlimited trades", "100,000 API calls", "100GB storage", "24/7 phone support", "Custom integrations", "Dedicated account manager"],
      grid_operator: ["Unlimited grid operations", "Real-time monitoring", "Regulatory reporting", "Priority infrastructure"]
    };
    return features[plan as keyof typeof features] || [];
  };

  if (!user) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
          <p className="text-gray-500">Sign in to manage your account settings and preferences.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Settings className="h-6 w-6 text-blue-600" />
            <span>Account Settings</span>
          </h2>
          <p className="text-gray-600">Manage your profile, notifications, billing, and security settings</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-300">
          {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} Account
        </Badge>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    <Button
                      size="sm"
                      variant={isEditing ? "destructive" : "outline"}
                      onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                    >
                      {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                  <CardDescription>
                    Update your personal and company information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profile.company}
                        onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={profile.jobTitle}
                        onChange={(e) => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={profile.timezone} onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))} disabled={!isEditing}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="Europe/London">GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleSaveProfile} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </div>
                  <Button size="sm" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Type</span>
                    <Badge variant="outline">{user.userType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plan</span>
                    <Badge className="bg-green-100 text-green-800">{user.tier}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Since</span>
                    <span className="text-sm text-gray-600">Jan 2024</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span>Email Notifications</span>
                </CardTitle>
                <CardDescription>
                  Configure when to receive email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`email-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={`email-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => handleNotificationChange('email', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  <span>SMS Notifications</span>
                </CardTitle>
                <CardDescription>
                  Configure SMS alerts for urgent notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.sms).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`sms-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={`sms-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => handleNotificationChange('sms', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span>Browser Notifications</span>
                </CardTitle>
                <CardDescription>
                  Real-time notifications in your browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.browser).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={`browser-${key}`} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Switch
                      id={`browser-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => handleNotificationChange('browser', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Notification Frequency</CardTitle>
                <CardDescription>
                  How often to group and send notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={notifications.frequency} onValueChange={(value) => handleNotificationChange('frequency', '', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  Urgent alerts will always be sent immediately regardless of this setting
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <div className="space-y-6">
            {/* Current Plan */}
            <Card className="bg-white/60 backdrop-blur-sm border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span>Current Plan</span>
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 capitalize">
                    {billing.plan} Plan
                  </Badge>
                </div>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Plan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Billing Cycle:</span>
                        <span className="capitalize">{billing.billingCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Billing:</span>
                        <span>{billing.nextBilling.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">
                          ${billing.plan === 'enterprise' ? '999' : billing.plan === 'professional' ? '299' : '99'}
                          /{billing.billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Usage This Month</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Trades</span>
                          <span>{billing.usage.trades.toLocaleString()} / {billing.usage.maxTrades.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(billing.usage.trades / billing.usage.maxTrades) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>API Calls</span>
                          <span>{billing.usage.apiCalls.toLocaleString()} / {billing.usage.maxApiCalls.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(billing.usage.apiCalls / billing.usage.maxApiCalls) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Storage</span>
                          <span>{billing.usage.dataStorage}GB / {billing.usage.maxStorage}GB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(billing.usage.dataStorage / billing.usage.maxStorage) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Plan Features</h4>
                    <ul className="space-y-1 text-sm">
                      {getPlanFeatures(billing.plan).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-2 mt-6">
                  <Button>Upgrade Plan</Button>
                  <Button variant="outline">Change Billing Cycle</Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method & Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Manage your payment information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">•••• •••• •••• {billing.paymentMethod.last4}</p>
                          <p className="text-sm text-gray-500">Expires {billing.paymentMethod.expiryDate}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">Primary</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Update Card
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Add Payment Method
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>
                    Download and view your billing history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billing.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-gray-500">{invoice.date.toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">${invoice.amount}</span>
                          <Badge className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {invoice.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <div className="space-y-6">
            {/* Security Overview */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Security Overview</span>
                </CardTitle>
                <CardDescription>
                  Manage your account security settings and access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold">Password</h4>
                    <p className="text-sm text-gray-500">Strong password set</p>
                    <Button size="sm" variant="outline" className="mt-2">Change</Button>
                  </div>
                  <div className="text-center">
                    <div className={`w-16 h-16 ${security.twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <Shield className={`h-8 w-8 ${security.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <h4 className="font-semibold">Two-Factor Auth</h4>
                    <p className="text-sm text-gray-500">
                      {security.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                    </p>
                    <Button
                      size="sm"
                      variant={security.twoFactorEnabled ? "outline" : "default"}
                      className="mt-2"
                      onClick={() => setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                    >
                      {security.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Key className="h-8 w-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">API Keys</h4>
                    <p className="text-sm text-gray-500">{security.apiKeys.length} active keys</p>
                    <Button size="sm" variant="outline" className="mt-2">Manage</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Keys */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-blue-600" />
                    <span>API Keys</span>
                  </CardTitle>
                  <Button size="sm" onClick={handleGenerateApiKey}>
                    <Key className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
                <CardDescription>
                  Manage API keys for programmatic access to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {security.apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{apiKey.name}</h4>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                            {apiKey.key.slice(0, 20)}...
                          </span>
                          <Button size="sm" variant="outline">Copy</Button>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Created:</span>
                          <span>{apiKey.created.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Last Used:</span>
                          <span>{apiKey.lastUsed.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Permissions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {apiKey.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Login History */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>
                  Recent account access and login attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {security.loginHistory.map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${login.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium">{login.location}</p>
                          <p className="text-sm text-gray-500">{login.device}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{login.date.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{login.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card className="bg-white/60 backdrop-blur-sm border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Data & Privacy</CardTitle>
                <CardDescription>
                  Export your data or delete your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Export Account Data</h4>
                      <p className="text-sm text-gray-500">Download all your account data and trading history</p>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-semibold text-red-600">Delete Account</h4>
                      <p className="text-sm text-red-500">Permanently delete your account and all associated data</p>
                    </div>
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex space-x-2">
                          <Button variant="destructive" className="flex-1">
                            Yes, delete my account
                          </Button>
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
