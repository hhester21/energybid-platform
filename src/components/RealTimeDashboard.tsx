"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Activity,
  Bell,
  Map,
  TrendingUp,
  Zap,
  RefreshCw,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Eye
} from "lucide-react";
import { LiveNotifications } from "./LiveNotifications";
import { LiveBiddingInterface } from "./LiveBiddingInterface";
import { EnergyMap } from "./EnergyMap";
import { Watchlist } from "./Watchlist";
import { useWebSocket, useMarketData } from "@/lib/use-websocket";
import { useWatchlist } from "@/lib/use-watchlist";

export function RealTimeDashboard() {
  const { connectionState, isConnected } = useWebSocket();
  const { marketData, lastUpdated } = useMarketData();
  const { watchlistCount } = useWatchlist();
  const [selectedAuction, setSelectedAuction] = useState<string | null>(null);
  const [liveBiddingOpen, setLiveBiddingOpen] = useState(false);

  const handleLaunchBidding = (auctionId: string) => {
    setSelectedAuction(auctionId);
    setLiveBiddingOpen(true);
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "connecting":
        return "bg-yellow-100 text-yellow-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Status Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">Real-Time Energy Trading Dashboard</h2>
                <p className="text-sm text-gray-600">Live market data and bidding activity</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {lastUpdated && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Updated {lastUpdated.toLocaleTimeString()}
                </Badge>
              )}
              <Badge className={getConnectionStatusColor()}>
                {connectionState === "connected" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                {connectionState.toUpperCase()}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Real-Time Market Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Zap className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm font-medium text-gray-500">Grid Demand</span>
              </div>
              <p className="text-xl font-bold text-blue-600">
                {marketData ? (marketData.gridStatus.demand / 1000).toFixed(1) : "--"} GW
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-gray-500">Supply</span>
              </div>
              <p className="text-xl font-bold text-green-600">
                {marketData ? (marketData.gridStatus.supply / 1000).toFixed(1) : "--"} GW
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-sm font-medium text-gray-500">Avg Price</span>
              </div>
              <p className="text-xl font-bold text-orange-600">
                ${marketData ? marketData.gridStatus.priceAvg.toFixed(3) : "--"}/kWh
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-sm font-medium text-gray-500">Connection</span>
              </div>
              <p className={`text-xl font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <Map className="h-4 w-4" />
            <span>Live Map</span>
          </TabsTrigger>
          <TabsTrigger value="watchlist" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Watchlist</span>
            {watchlistCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {watchlistCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="bidding" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Live Bidding</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Notifications Panel */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <span>Recent Alerts</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const tabsList = document.querySelector('[data-radix-collection-item]');
                      if (tabsList) {
                        const notificationsTab = document.querySelector('[value="notifications"]') as HTMLElement;
                        notificationsTab?.click();
                      }
                    }}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Tesla Supercharger placed bid</p>
                      <span className="text-xs text-gray-500">2m ago</span>
                    </div>
                    <p className="text-xs text-gray-600">$0.013/kWh for 15.0 MWh</p>
                  </div>
                  <div className="p-3 border-l-4 border-l-orange-500 bg-orange-50 rounded">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Price Alert: Roscoe Wind Farm</p>
                      <span className="text-xs text-gray-500">5m ago</span>
                    </div>
                    <p className="text-xs text-gray-600">Price below threshold: $0.011/kWh</p>
                  </div>
                  <div className="p-3 border-l-4 border-l-green-500 bg-green-50 rounded">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">New auction started</p>
                      <span className="text-xs text-gray-500">8m ago</span>
                    </div>
                    <p className="text-xs text-gray-600">Mojave Solar Farm - 25.5 MWh</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Auctions Quick Panel */}
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Hot Auctions</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const biddingTab = document.querySelector('[value="bidding"]') as HTMLElement;
                      biddingTab?.click();
                    }}
                  >
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 transition-colors cursor-pointer"
                    onClick={() => handleLaunchBidding("auction_1")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Mojave Solar Farm</h3>
                      <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Available</p>
                        <p className="font-bold text-blue-600">25.5 MWh</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Bid</p>
                        <p className="font-bold text-green-600">$0.012/kWh</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time Left</p>
                        <p className="font-bold text-orange-600">42m</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors cursor-pointer"
                    onClick={() => handleLaunchBidding("auction_2")}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Roscoe Wind Farm</h3>
                      <Badge className="bg-orange-100 text-orange-800">ENDING SOON</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Available</p>
                        <p className="font-bold text-blue-600">18.3 MWh</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Bid</p>
                        <p className="font-bold text-green-600">$0.018/kWh</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time Left</p>
                        <p className="font-bold text-red-600">8m</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Map Tab */}
        <TabsContent value="map">
          <EnergyMap />
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist">
          <Watchlist />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <LiveNotifications />
        </TabsContent>

        {/* Live Bidding Tab */}
        <TabsContent value="bidding">
          <LiveBiddingInterface auctionId="auction_1" />
        </TabsContent>
      </Tabs>

      {/* Live Bidding Modal */}
      <Dialog open={liveBiddingOpen} onOpenChange={setLiveBiddingOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Live Bidding Interface</DialogTitle>
            <DialogDescription>
              Real-time bidding for {selectedAuction || "selected energy auction"}
            </DialogDescription>
          </DialogHeader>
          <LiveBiddingInterface auctionId={selectedAuction || "auction_1"} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
