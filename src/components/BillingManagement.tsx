"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  CreditCard,
  DollarSign,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Database,
  Phone,
  Mail,
  Check,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Crown,
  Star,
  Building,
  Globe
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface PlanFeature {
  name: string;
  included: boolean;
  value?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  popular?: boolean;
  features: PlanFeature[];
  limits: {
    trades: number | "unlimited";
    apiCalls: number | "unlimited";
    storage: number | "unlimited"; // GB
    users: number | "unlimited";
  };
  userTypes: string[];
}

interface PaymentMethod {
  id: string;
  type: "credit_card" | "bank_account" | "crypto";
  name: string;
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
  brand?: string;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: "paid" | "pending" | "overdue" | "failed";
  period: {
    start: Date;
    end: Date;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  downloadUrl: string;
}

interface UsageData {
  period: string;
  trades: number;
  apiCalls: number;
  storage: number;
  cost: number;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individual traders getting started",
    price: { monthly: 99, annual: 990 },
    features: [
      { name: "Energy Trading", included: true },
      { name: "Basic Analytics", included: true },
      { name: "Email Support", included: true },
      { name: "Mobile App", included: true },
      { name: "Advanced AI Insights", included: false },
      { name: "API Access", included: false },
      { name: "Smart Contracts", included: false },
      { name: "Priority Support", included: false }
    ],
    limits: {
      trades: 100,
      apiCalls: 1000,
      storage: 1,
      users: 1
    },
    userTypes: ["consumer", "producer"]
  },
  {
    id: "professional",
    name: "Professional",
    description: "Advanced features for growing energy businesses",
    price: { monthly: 299, annual: 2990 },
    popular: true,
    features: [
      { name: "Everything in Starter", included: true },
      { name: "Advanced AI Insights", included: true },
      { name: "API Access", included: true, value: "10,000 calls/month" },
      { name: "Smart Contracts", included: true },
      { name: "Auto-bidding Engine", included: true },
      { name: "Priority Support", included: true },
      { name: "Custom Integrations", included: false },
      { name: "Dedicated Account Manager", included: false }
    ],
    limits: {
      trades: 1000,
      apiCalls: 10000,
      storage: 10,
      users: 5
    },
    userTypes: ["consumer", "producer"]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Complete solution for large-scale energy operations",
    price: { monthly: 999, annual: 9990 },
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Unlimited Trading", included: true },
      { name: "Custom Integrations", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "24/7 Phone Support", included: true },
      { name: "SLA Guarantee", included: true, value: "99.9% uptime" },
      { name: "Custom Reporting", included: true },
      { name: "White-label Options", included: true }
    ],
    limits: {
      trades: "unlimited",
      apiCalls: 100000,
      storage: 100,
      users: "unlimited"
    },
    userTypes: ["consumer", "producer", "enterprise"]
  },
  {
    id: "grid_operator",
    name: "Grid Operator",
    description: "Specialized tools for grid operators and utilities",
    price: { monthly: 1999, annual: 19990 },
    features: [
      { name: "Grid Management Tools", included: true },
      { name: "Real-time Monitoring", included: true },
      { name: "Regulatory Reporting", included: true },
      { name: "Load Forecasting", included: true },
      { name: "Emergency Response", included: true },
      { name: "Compliance Dashboard", included: true },
      { name: "Priority Infrastructure", included: true },
      { name: "Custom Development", included: true }
    ],
    limits: {
      trades: "unlimited",
      apiCalls: "unlimited",
      storage: "unlimited",
      users: "unlimited"
    },
    userTypes: ["grid_operator"]
  }
];

export function BillingManagement() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState("professional");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = () => {
    // Sample payment methods
    setPaymentMethods([
      {
        id: "pm1",
        type: "credit_card",
        name: "Visa ending in 4567",
        last4: "4567",
        expiryDate: "12/26",
        isDefault: true,
        brand: "visa"
      },
      {
        id: "pm2",
        type: "bank_account",
        name: "Business Checking",
        last4: "7890",
        isDefault: false
      }
    ]);

    // Sample invoices
    setInvoices([
      {
        id: "INV-2024-003",
        date: new Date(),
        amount: 299,
        status: "pending",
        period: {
          start: new Date(2024, 11, 1),
          end: new Date(2024, 11, 31)
        },
        items: [
          {
            description: "Professional Plan - December 2024",
            quantity: 1,
            unitPrice: 299,
            total: 299
          }
        ],
        downloadUrl: "#"
      },
      {
        id: "INV-2024-002",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        amount: 299,
        status: "paid",
        period: {
          start: new Date(2024, 10, 1),
          end: new Date(2024, 10, 30)
        },
        items: [
          {
            description: "Professional Plan - November 2024",
            quantity: 1,
            unitPrice: 299,
            total: 299
          }
        ],
        downloadUrl: "#"
      },
      {
        id: "INV-2024-001",
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        amount: 299,
        status: "paid",
        period: {
          start: new Date(2024, 9, 1),
          end: new Date(2024, 9, 31)
        },
        items: [
          {
            description: "Professional Plan - October 2024",
            quantity: 1,
            unitPrice: 299,
            total: 299
          }
        ],
        downloadUrl: "#"
      }
    ]);

    // Sample usage data
    setUsageData([
      { period: "Dec 2024", trades: 156, apiCalls: 8420, storage: 2.4, cost: 299 },
      { period: "Nov 2024", trades: 142, apiCalls: 7650, storage: 2.1, cost: 299 },
      { period: "Oct 2024", trades: 178, apiCalls: 9230, storage: 2.8, cost: 299 },
      { period: "Sep 2024", trades: 134, apiCalls: 6890, storage: 1.9, cost: 299 },
      { period: "Aug 2024", trades: 201, apiCalls: 10450, storage: 3.2, cost: 299 },
      { period: "Jul 2024", trades: 189, apiCalls: 9870, storage: 2.9, cost: 299 }
    ]);
  };

  const getCurrentPlan = () => {
    return subscriptionPlans.find(plan => plan.id === currentPlan);
  };

  const handleUpgradePlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowUpgradeDialog(true);
  };

  const confirmUpgrade = () => {
    setCurrentPlan(selectedPlan);
    setShowUpgradeDialog(false);
    // Here you would integrate with payment processor
    console.log("Upgrading to plan:", selectedPlan);
  };

  const handleAddPaymentMethod = () => {
    // Simulate adding payment method
    const newPaymentMethod: PaymentMethod = {
      id: `pm${Date.now()}`,
      type: "credit_card",
      name: "New Card ending in 1234",
      last4: "1234",
      expiryDate: "08/28",
      isDefault: false,
      brand: "mastercard"
    };
    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    setShowAddPaymentDialog(false);
  };

  const setDefaultPaymentMethod = (methodId: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
  };

  const deletePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
  };

  const currentPlanData = getCurrentPlan();
  const currentUsage = usageData[0];

  if (!user) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Billing Management</h3>
          <p className="text-gray-500">Sign in to manage your subscription and billing.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            <span>Billing Management</span>
          </h2>
          <p className="text-gray-600">Manage your subscription, usage, and payment methods</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600 border-blue-300">
            {currentPlanData?.name} Plan
          </Badge>
          <Button onClick={() => handleUpgradePlan("enterprise")}>
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span>Current Subscription</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={billingCycle === "monthly" ? "default" : "outline"}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </Button>
              <Button
                size="sm"
                variant={billingCycle === "annual" ? "default" : "outline"}
                onClick={() => setBillingCycle("annual")}
              >
                Annual (Save 17%)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-600">
                ${currentPlanData?.price[billingCycle] || 299}
                <span className="text-sm font-normal text-gray-500">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
              </h3>
              <p className="text-gray-600">{currentPlanData?.name} Plan</p>
              <p className="text-sm text-gray-500 mt-1">
                Next billing: {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>

            {currentUsage && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Trades Used</span>
                    <span>{currentUsage.trades} / {currentPlanData?.limits.trades}</span>
                  </div>
                  <Progress
                    value={typeof currentPlanData?.limits.trades === 'number'
                      ? (currentUsage.trades / currentPlanData.limits.trades) * 100
                      : 50
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>API Calls</span>
                    <span>{currentUsage.apiCalls.toLocaleString()} / {currentPlanData?.limits.apiCalls.toLocaleString()}</span>
                  </div>
                  <Progress
                    value={typeof currentPlanData?.limits.apiCalls === 'number'
                      ? (currentUsage.apiCalls / currentPlanData.limits.apiCalls) * 100
                      : 50
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage</span>
                    <span>{currentUsage.storage}GB / {currentPlanData?.limits.storage}GB</span>
                  </div>
                  <Progress
                    value={typeof currentPlanData?.limits.storage === 'number'
                      ? (currentUsage.storage / currentPlanData.limits.storage) * 100
                      : 50
                    }
                    className="h-2"
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Usage & Analytics Tab */}
        <TabsContent value="usage" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Usage History</CardTitle>
                  <CardDescription>Track your platform usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageData.map((data, index) => (
                      <div key={data.period} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{data.period}</h4>
                          <Badge variant="outline">${data.cost}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Trades</p>
                            <p className="font-semibold">{data.trades}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">API Calls</p>
                            <p className="font-semibold">{data.apiCalls.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Storage</p>
                            <p className="font-semibold">{data.storage}GB</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Usage Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Total Trades</span>
                      </div>
                      <span className="font-semibold">{usageData.reduce((sum, d) => sum + d.trades, 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-green-600" />
                        <span className="text-sm">API Calls</span>
                      </div>
                      <span className="font-semibold">{usageData.reduce((sum, d) => sum + d.apiCalls, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Avg Storage</span>
                      </div>
                      <span className="font-semibold">{(usageData.reduce((sum, d) => sum + d.storage, 0) / usageData.length).toFixed(1)}GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Total Cost</span>
                      </div>
                      <span className="font-semibold">${usageData.reduce((sum, d) => sum + d.cost, 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Cost Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Efficient Usage</p>
                          <p className="text-xs text-green-600">You're using 78% of your plan limits efficiently</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Upgrade Recommendation</p>
                          <p className="text-xs text-blue-600">Consider Enterprise for better value at your usage level</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Plans & Pricing Tab */}
        <TabsContent value="plans" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`bg-white/60 backdrop-blur-sm relative ${
                  plan.popular ? 'ring-2 ring-blue-500 border-blue-300' : ''
                } ${plan.id === currentPlan ? 'bg-blue-50 border-blue-300' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                {plan.id === currentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white">Current Plan</Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {plan.id === "enterprise" && <Crown className="h-5 w-5 text-yellow-500" />}
                    {plan.id === "grid_operator" && <Building className="h-5 w-5 text-purple-500" />}
                    <span>{plan.name}</span>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    ${plan.price[billingCycle]}
                    <span className="text-sm font-normal text-gray-500">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {billingCycle === "annual" && (
                    <p className="text-sm text-green-600">
                      Save ${plan.price.monthly * 12 - plan.price.annual} per year
                    </p>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <span className={feature.included ? "text-gray-900" : "text-gray-400"}>
                            {feature.name}
                          </span>
                          {feature.value && (
                            <span className="text-sm text-gray-500 block">{feature.value}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span>Trades:</span>
                      <span className="font-medium">
                        {plan.limits.trades === "unlimited" ? "Unlimited" : plan.limits.trades.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>API Calls:</span>
                      <span className="font-medium">
                        {plan.limits.apiCalls === "unlimited" ? "Unlimited" : plan.limits.apiCalls.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="font-medium">
                        {plan.limits.storage === "unlimited" ? "Unlimited" : `${plan.limits.storage}GB`}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={plan.id === currentPlan ? "outline" : "default"}
                    disabled={plan.id === currentPlan}
                    onClick={() => plan.id !== currentPlan && handleUpgradePlan(plan.id)}
                  >
                    {plan.id === currentPlan ? "Current Plan" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Methods</CardTitle>
                  <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                        <DialogDescription>
                          Add a new credit card or bank account for billing
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input id="expiryDate" placeholder="MM/YY" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input id="cvv" placeholder="123" />
                          </div>
                          <div>
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input id="zipCode" placeholder="12345" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input id="cardName" placeholder="John Doe" />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleAddPaymentMethod} className="flex-1">
                            Add Payment Method
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardDescription>
                  Manage your payment methods and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            {method.expiryDate && (
                              <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <Badge variant="outline" className="text-green-600">Default</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDefaultPaymentMethod(method.id)}
                            disabled={method.isDefault}
                          >
                            {method.isDefault ? "Default" : "Set Default"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deletePaymentMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Update your billing address and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" defaultValue="Energy Solutions Inc." />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue="123 Energy Street" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="San Francisco" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" defaultValue="CA" />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" defaultValue="94105" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select defaultValue="us">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    Update Billing Information
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your invoices and billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-semibold">{invoice.id}</p>
                          <p className="text-sm text-gray-500">
                            {invoice.period.start.toLocaleDateString()} - {invoice.period.end.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-lg">${invoice.amount}</span>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Invoice Details
                        </summary>
                        <div className="mt-2 space-y-2">
                          {invoice.items.map((item, index) => (
                            <div key={index} className="flex justify-between py-1">
                              <span>{item.description}</span>
                              <span>${item.total}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
            <DialogDescription>
              Confirm your plan upgrade to unlock additional features and higher limits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlan && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold">
                  {subscriptionPlans.find(p => p.id === selectedPlan)?.name} Plan
                </h4>
                <p className="text-sm text-gray-600">
                  ${subscriptionPlans.find(p => p.id === selectedPlan)?.price[billingCycle]}
                  /{billingCycle === "monthly" ? "month" : "year"}
                </p>
              </div>
            )}
            <div className="flex space-x-2">
              <Button onClick={confirmUpgrade} className="flex-1">
                Confirm Upgrade
              </Button>
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
