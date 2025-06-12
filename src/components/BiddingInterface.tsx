"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Target,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface Bid {
  id: number;
  bidder: string;
  amount: number;
  price: number;
  timestamp: Date;
  status: "active" | "outbid" | "won";
  bidderType: "EV Charging" | "AI Data Center" | "BTC Mining" | "HPC Facility";
}

interface EnergyAuction {
  id: number;
  location: string;
  type: "Solar" | "Wind" | "Hydro";
  available: number;
  startingPrice: number;
  currentPrice: number;
  timeRemaining: string;
  totalBids: number;
  status: "active" | "ending" | "closed";
  producer: string;
  bids: Bid[];
}

const activeAuctions: EnergyAuction[] = [
  {
    id: 1,
    location: "Mojave Solar Farm",
    type: "Solar",
    available: 25.5,
    startingPrice: -0.02,
    currentPrice: 0.012,
    timeRemaining: "2h 45m",
    totalBids: 12,
    status: "active",
    producer: "SolarGen Corp",
    bids: [
      { id: 1, bidder: "Tesla Supercharger Network", amount: 15.0, price: 0.012, timestamp: new Date(), status: "active", bidderType: "EV Charging" },
      { id: 2, bidder: "Google DeepMind", amount: 8.5, price: 0.011, timestamp: new Date(), status: "outbid", bidderType: "AI Data Center" },
      { id: 3, bidder: "CleanSpark Mining", amount: 10.0, price: 0.010, timestamp: new Date(), status: "outbid", bidderType: "BTC Mining" }
    ]
  },
  {
    id: 2,
    location: "Roscoe Wind Farm",
    type: "Wind",
    available: 18.3,
    startingPrice: 0.005,
    currentPrice: 0.018,
    timeRemaining: "45m",
    totalBids: 8,
    status: "ending",
    producer: "Texas Wind Energy",
    bids: [
      { id: 4, bidder: "NVIDIA AI Research", amount: 18.3, price: 0.018, timestamp: new Date(), status: "active", bidderType: "AI Data Center" },
      { id: 5, bidder: "ChargePoint Network", amount: 12.0, price: 0.016, timestamp: new Date(), status: "outbid", bidderType: "EV Charging" },
    ]
  }
];

const getBidderTypeColor = (type: string) => {
  switch (type) {
    case "EV Charging":
      return "bg-green-100 text-green-800";
    case "AI Data Center":
      return "bg-blue-100 text-blue-800";
    case "BTC Mining":
      return "bg-orange-100 text-orange-800";
    case "HPC Facility":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "ending":
      return "bg-orange-100 text-orange-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

export function BiddingInterface() {
  const [selectedAuction, setSelectedAuction] = useState<EnergyAuction | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [energyAmount, setEnergyAmount] = useState("");

  const handlePlaceBid = () => {
    // Simulate bid placement
    console.log("Placing bid:", { bidAmount, bidPrice, energyAmount });
    setBidAmount("");
    setBidPrice("");
    setEnergyAmount("");
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Active Auctions</p>
                <p className="text-xl font-bold text-blue-600">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bidders</p>
                <p className="text-xl font-bold text-green-600">156</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Energy Available</p>
                <p className="text-xl font-bold text-purple-600">342 MWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Avg. Price</p>
                <p className="text-xl font-bold text-orange-600">$0.014/kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Bidding Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Auctions List */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Live Energy Auctions</span>
              </CardTitle>
              <CardDescription>
                Real-time bidding on surplus renewable energy blocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAuctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                    onClick={() => setSelectedAuction(auction)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{auction.location}</h3>
                          <Badge variant="outline">{auction.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(auction.status)}>
                          {auction.status.toUpperCase()}
                        </Badge>
                        <div className="flex items-center space-x-1 text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">{auction.timeRemaining}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Available</p>
                        <p className="font-bold text-blue-600">{auction.available} MWh</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Price</p>
                        <p className="font-bold text-green-600">${auction.currentPrice}/kWh</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Starting Price</p>
                        <p className="font-bold text-gray-600">${auction.startingPrice}/kWh</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Bids</p>
                        <p className="font-bold text-purple-600">{auction.totalBids}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Producer:</span>
                        <span className="text-sm font-medium">{auction.producer}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={(e) => e.stopPropagation()}>
                            Place Bid
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Place Bid - {auction.location}</DialogTitle>
                            <DialogDescription>
                              Enter your bid details for {auction.available} MWh of {auction.type.toLowerCase()} energy
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="energy-amount">Energy Amount (MWh)</Label>
                              <Input
                                id="energy-amount"
                                placeholder={`Max: ${auction.available} MWh`}
                                value={energyAmount}
                                onChange={(e) => setEnergyAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="bid-price">Your Bid Price ($/kWh)</Label>
                              <Input
                                id="bid-price"
                                placeholder={`Current: $${auction.currentPrice}/kWh`}
                                value={bidPrice}
                                onChange={(e) => setBidPrice(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="company-type">Company Type</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your industry" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ev-charging">EV Charging Network</SelectItem>
                                  <SelectItem value="ai-datacenter">AI Data Center</SelectItem>
                                  <SelectItem value="btc-mining">Bitcoin Mining</SelectItem>
                                  <SelectItem value="hpc-facility">HPC Facility</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handlePlaceBid} className="w-full">
                              Confirm Bid
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bidding Details Sidebar */}
        <div className="space-y-6">
          {/* Current Bids for Selected Auction */}
          {selectedAuction && (
            <Card className="bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Current Bids</span>
                </CardTitle>
                <CardDescription>
                  {selectedAuction.location} - {selectedAuction.available} MWh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedAuction.bids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{bid.bidder}</p>
                        <p className="text-xs text-gray-500">{bid.amount} MWh</p>
                        <Badge className={getBidderTypeColor(bid.bidderType)}>
                          {bid.bidderType}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${bid.price}/kWh</p>
                        <div className="flex items-center space-x-1">
                          {bid.status === "active" ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-orange-500" />
                          )}
                          <span className="text-xs text-gray-500">{bid.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Bid Actions */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-orange-600" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Navigate to auto-bidding tab in main dashboard
                  const autoBidTab = document.querySelector('[value="auto-bidding"]') as HTMLElement;
                  if (autoBidTab) {
                    autoBidTab.click();
                  }
                  if (typeof window !== "undefined" && Notification.permission === "granted") {
                    new Notification("Opening Auto-Bidding! 🤖", {
                      body: "Configure your automated bidding strategies",
                      icon: "⚡"
                    });
                  }
                }}
              >
                <Target className="h-4 w-4 mr-2" />
                Auto-Bid Setup
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  alert("📊 My Bids Feature\n\nShowing your recent bidding activity:\n• 3 active bids\n• 12 completed bids\n• 89% success rate\n\nFull bid history would be displayed here in a production environment.");
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                View My Bids
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Navigate to watchlist where alerts are managed
                  const watchlistTab = document.querySelector('[value="watchlist"]') as HTMLElement;
                  if (watchlistTab) {
                    watchlistTab.click();
                  }
                  if (typeof window !== "undefined" && Notification.permission === "granted") {
                    new Notification("Energy Alerts! 🔔", {
                      body: "Manage your price alerts and notifications in the watchlist",
                      icon: "⚡"
                    });
                  }
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                Energy Alerts
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  alert("📈 Bid History\n\nYour bidding history:\n• Total bids placed: 127\n• Average bid price: $0.014/kWh\n• Total energy secured: 2,340 MWh\n• Cost savings: $127,500\n\nDetailed history would be shown in a full interface.");
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Bid History
              </Button>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm">Market Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg. Winning Bid:</span>
                <span className="font-medium">$0.016/kWh</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Success Rate:</span>
                <span className="font-medium text-green-600">68%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ending Soon:</span>
                <span className="font-medium text-orange-600">3 auctions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
