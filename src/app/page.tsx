"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";

const EnergyMap = dynamic(
  () => import("@/components/EnergyMap").then((mod) => mod.EnergyMap),
  { ssr: false }
);
import { BiddingInterface } from "@/components/BiddingInterface";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { GreenCertificationTracker } from "@/components/GreenCertificationTracker";
import { AutoBiddingManager } from "@/components/AutoBiddingManager";
import { AIInsightsDashboard } from "@/components/AIInsightsDashboard";
import { SmartContractsDashboard } from "@/components/SmartContractsDashboard";
import { APIHealthMonitor } from "@/components/APIHealthMonitor";
import { ProductionBanner } from "@/components/ProductionBanner";
import { UserProfile } from "@/components/UserProfile";
import { UserTypeSwitch } from "@/components/UserTypeSwitch";
import { RealTimeDashboard } from "@/components/RealTimeDashboard";
import { useAuth, hasPermission } from "@/lib/auth-context";
import {
  Zap,
  MapPin,
  TrendingDown,
  TrendingUp,
  Leaf,
  DollarSign,
  Wind,
  Sun,
  Droplets,
  Activity,
  Users,
  Target,
  BarChart3,
  Settings,
  Brain,
  FileText
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("map");
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
          <p className="text-gray-600">Access the EnergyBid marketplace</p>
        </div>
      </div>
    );
  }

  // Convert auth user to UserProfile format
  const currentUser = {
    name: user.name,
    email: user.email,
    company: user.company,
    role: user.userType === "producer" ? "Energy Producer" :
          user.userType === "consumer" ? "Energy Consumer" : "Grid Operator",
    tier: user.tier,
    avatar: user.avatar || ""
  };

  // Sample data for the dashboard
  const energyBlocks = [
    {
      id: 1,
      location: "California Solar Farm",
      type: "Solar",
      available: 25.5,
      price: -0.02,
      coordinates: { lat: 34.0522, lng: -118.2437 },
      icon: Sun
    },
    {
      id: 2,
      location: "Texas Wind Farm",
      type: "Wind",
      available: 18.3,
      price: 0.01,
      coordinates: { lat: 31.9686, lng: -99.9018 },
      icon: Wind
    },
    {
      id: 3,
      location: "Oregon Hydro Plant",
      type: "Hydro",
      available: 12.7,
      price: 0.005,
      coordinates: { lat: 44.9319, lng: -123.0289 },
      icon: Droplets
    }
  ];

  const metrics = {
    totalSavings: 127500,
    greenCredits: 156,
    energyConsumed: 342.8,
    co2Reduced: 89.4
  };

  const recentBids = [
    { id: 1, company: "Tesla Supercharger", amount: 15.0, price: 0.012, status: "won" },
    { id: 2, company: "Google AI Center", amount: 8.5, price: 0.015, status: "active" },
    { id: 3, company: "Bitcoin Mining Co", amount: 22.0, price: 0.008, status: "outbid" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-green-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  EnergyBid
                </h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Live Market
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <UserTypeSwitch />
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Demo Mode
              </Badge>
              <UserProfile user={currentUser} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Production Banner */}
        <ProductionBanner />
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                ${metrics.totalSavings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                32% reduction in energy costs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Green Credits</CardTitle>
              <Leaf className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{metrics.greenCredits}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                15 earned this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Consumed</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{metrics.energyConsumed} MWh</div>
              <p className="text-xs text-muted-foreground">
                100% renewable sources
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Reduced</CardTitle>
              <Leaf className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{metrics.co2Reduced}t</div>
              <p className="text-xs text-muted-foreground">
                Environmental impact
              </p>
            </CardContent>
          </Card>
        </div>

        {/* API Health Monitor - Production Only */}
        <APIHealthMonitor />

        {/* Main Tabbed Interface */}
        <Tabs defaultValue="realtime" className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-white/60 backdrop-blur-sm text-xs">
            <TabsTrigger value="realtime" className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span>Real-Time</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>Map</span>
            </TabsTrigger>
            {hasPermission(user, "place_bids") && (
              <TabsTrigger value="marketplace" className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>Market</span>
              </TabsTrigger>
            )}
            {user?.userType === "consumer" && (
              <TabsTrigger value="auto-bidding" className="flex items-center space-x-1">
                <Settings className="h-3 w-3" />
                <span>Auto-Bid</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="ai-insights" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>AI Insights</span>
            </TabsTrigger>
            <TabsTrigger value="smart-contracts" className="flex items-center space-x-1">
              <FileText className="h-3 w-3" />
              <span>Contracts</span>
            </TabsTrigger>
            {hasPermission(user, "view_analytics") && (
              <TabsTrigger value="analytics" className="flex items-center space-x-1">
                <BarChart3 className="h-3 w-3" />
                <span>Analytics</span>
              </TabsTrigger>
            )}
            {hasPermission(user, "view_certificates") && (
              <TabsTrigger value="certificates" className="flex items-center space-x-1">
                <Leaf className="h-3 w-3" />
                <span>Certs</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="realtime" className="mt-6">
            <RealTimeDashboard />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <EnergyMap />
          </TabsContent>

          <TabsContent value="marketplace" className="mt-6">
            <BiddingInterface />
          </TabsContent>

          <TabsContent value="auto-bidding" className="mt-6">
            <AutoBiddingManager />
          </TabsContent>

          <TabsContent value="ai-insights" className="mt-6">
            <AIInsightsDashboard />
          </TabsContent>

          <TabsContent value="smart-contracts" className="mt-6">
            <SmartContractsDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="certificates" className="mt-6">
            <GreenCertificationTracker />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
