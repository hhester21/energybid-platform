"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX,
  Gavel,
  Trophy
} from "lucide-react";
import { useLiveBidding, type BidUpdate } from "@/lib/use-websocket";
import { formatDistanceToNow } from "date-fns";

interface LiveBiddingInterfaceProps {
  auctionId?: string;
  energyBlock?: {
    id: string;
    location: string;
    type: string;
    available: number;
    currentPrice: number;
    timeRemaining: string;
    producer: string;
  };
}

export function LiveBiddingInterface({ auctionId = "auction_1", energyBlock }: LiveBiddingInterfaceProps) {
  const { bids, currentHighestBid, placeBid, isConnected } = useLiveBidding(auctionId);
  const [bidAmount, setBidAmount] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [bidderType, setBidderType] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-bidding settings
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [maxBidPrice, setMaxBidPrice] = useState("");
  const [bidIncrement, setBidIncrement] = useState("0.001");

  // Default energy block for demo
  const defaultEnergyBlock = {
    id: auctionId,
    location: "Mojave Solar Farm",
    type: "Solar",
    available: 25.5,
    currentPrice: 0.012,
    timeRemaining: "45m",
    producer: "SolarGen Corp"
  };

  const currentBlock = energyBlock || defaultEnergyBlock;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Audio notification for new bids
  const playBidSound = useCallback(() => {
    if (soundEnabled && typeof window !== "undefined") {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.log("Audio notification not available");
      }
    }
  }, [soundEnabled]);

  // Play sound when new bid is received
  useEffect(() => {
    if (bids.length > 0) {
      playBidSound();
    }
  }, [bids.length, playBidSound]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeProgress = () => {
    const totalTime = 45 * 60; // 45 minutes
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getTimeUrgencyColor = () => {
    if (timeLeft < 300) return "text-red-600"; // Less than 5 minutes
    if (timeLeft < 900) return "text-orange-600"; // Less than 15 minutes
    return "text-green-600";
  };

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

  const handlePlaceBid = async () => {
    if (!bidAmount || !bidPrice || !bidderType) return;

    setIsSubmitting(true);

    try {
      await placeBid({
        amount: Number.parseFloat(bidAmount),
        price: Number.parseFloat(bidPrice),
        bidderType
      });

      // Reset form
      setBidAmount("");
      setBidPrice("");
      setBidderType("");

      // Success notification
      if (typeof window !== "undefined" && Notification.permission === "granted") {
        new Notification("Bid Placed! 🎯", {
          body: `Your bid of $${bidPrice}/kWh for ${bidAmount} MWh has been submitted.`,
          icon: "⚡"
        });
      }
    } catch (error) {
      console.error("Failed to place bid:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoBid = () => {
    if (!autoBidEnabled || !currentHighestBid || !maxBidPrice) return;

    const newBidPrice = currentHighestBid.price + Number.parseFloat(bidIncrement);

    if (newBidPrice <= Number.parseFloat(maxBidPrice)) {
      placeBid({
        amount: Number.parseFloat(bidAmount) || currentBlock.available,
        price: newBidPrice,
        bidderType: bidderType || "AI Data Center"
      });
    }
  };

  // Auto-bidding logic
  useEffect(() => {
    if (autoBidEnabled && currentHighestBid) {
      const timer = setTimeout(handleAutoBid, 2000); // Wait 2 seconds before auto-bidding
      return () => clearTimeout(timer);
    }
  }, [currentHighestBid, autoBidEnabled]);

  return (
    <div className="space-y-6">
      {/* Auction Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gavel className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">{currentBlock.location}</h2>
                <p className="text-sm text-gray-600">{currentBlock.type} Energy • {currentBlock.available} MWh Available</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Badge className="bg-green-100 text-green-800">
                  <Zap className="h-3 w-3 mr-1" />
                  LIVE AUCTION
                </Badge>
              ) : (
                <Badge variant="destructive">DISCONNECTED</Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="h-8 w-8 p-0"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Current Price */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm font-medium text-gray-500">Current Bid</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${currentHighestBid?.price.toFixed(3) || currentBlock.currentPrice.toFixed(3)}/kWh
              </p>
            </div>

            {/* Time Remaining */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-sm font-medium text-gray-500">Time Left</span>
              </div>
              <p className={`text-2xl font-bold ${getTimeUrgencyColor()}`}>
                {formatTime(timeLeft)}
              </p>
              <Progress value={getTimeProgress()} className="mt-2 h-2" />
            </div>

            {/* Total Bids */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm font-medium text-gray-500">Total Bids</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{bids.length}</p>
            </div>

            {/* Leading Bidder */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Trophy className="h-4 w-4 text-purple-600 mr-1" />
                <span className="text-sm font-medium text-gray-500">Leading Bidder</span>
              </div>
              <p className="text-sm font-bold text-purple-600">
                {currentHighestBid?.bidder || "No bids yet"}
              </p>
              {currentHighestBid && (
                <Badge className={getBidderTypeColor(currentHighestBid.bidderType)} variant="secondary">
                  {currentHighestBid.bidderType}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bidding Form */}
        <div className="lg:col-span-1">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Place Your Bid</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bid-amount">Energy Amount (MWh)</Label>
                <Input
                  id="bid-amount"
                  type="number"
                  placeholder={`Max: ${currentBlock.available} MWh`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  max={currentBlock.available}
                />
              </div>

              <div>
                <Label htmlFor="bid-price">Your Bid Price ($/kWh)</Label>
                <Input
                  id="bid-price"
                  type="number"
                  step="0.001"
                  placeholder={`Current: $${currentHighestBid?.price.toFixed(3) || currentBlock.currentPrice.toFixed(3)}/kWh`}
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bidder-type">Company Type</Label>
                <Select value={bidderType} onValueChange={setBidderType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EV Charging">EV Charging Network</SelectItem>
                    <SelectItem value="AI Data Center">AI Data Center</SelectItem>
                    <SelectItem value="BTC Mining">Bitcoin Mining</SelectItem>
                    <SelectItem value="HPC Facility">HPC Facility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handlePlaceBid}
                className="w-full"
                disabled={!bidAmount || !bidPrice || !bidderType || isSubmitting || timeLeft === 0}
              >
                {isSubmitting ? "Placing Bid..." : `Bid $${bidPrice}/kWh`}
              </Button>

              <Separator />

              {/* Auto-Bidding Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Auto-Bidding</Label>
                  <Button
                    size="sm"
                    variant={autoBidEnabled ? "destructive" : "outline"}
                    onClick={() => setAutoBidEnabled(!autoBidEnabled)}
                  >
                    {autoBidEnabled ? "Stop Auto-Bid" : "Enable Auto-Bid"}
                  </Button>
                </div>

                {autoBidEnabled && (
                  <>
                    <div>
                      <Label htmlFor="max-bid-price" className="text-xs">Max Bid Price ($/kWh)</Label>
                      <Input
                        id="max-bid-price"
                        type="number"
                        step="0.001"
                        placeholder="0.020"
                        value={maxBidPrice}
                        onChange={(e) => setMaxBidPrice(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bid-increment" className="text-xs">Bid Increment ($/kWh)</Label>
                      <Input
                        id="bid-increment"
                        type="number"
                        step="0.001"
                        value={bidIncrement}
                        onChange={(e) => setBidIncrement(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                      <AlertCircle className="h-3 w-3 inline mr-1 text-orange-600" />
                      Auto-bidding will place bids up to your max price
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Bid Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Live Bid Activity</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {bids.length} recent bids
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {bids.length === 0 ? (
                    <div className="text-center py-8">
                      <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No bids yet. Be the first to bid!</p>
                    </div>
                  ) : (
                    bids.map((bid, index) => (
                      <div
                        key={`${bid.timestamp.getTime()}-${index}`}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                          index === 0
                            ? 'bg-green-50 border-green-200 ring-2 ring-green-100'
                            : 'bg-gray-50 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-green-500 text-white text-sm">
                              {bid.bidder.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{bid.bidder}</p>
                            <div className="flex items-center space-x-2">
                              <Badge className={getBidderTypeColor(bid.bidderType)} variant="secondary">
                                {bid.bidderType}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(bid.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            ${bid.price.toFixed(3)}/kWh
                          </p>
                          <p className="text-sm text-gray-600">{bid.amount.toFixed(1)} MWh</p>
                          {index === 0 && (
                            <div className="flex items-center space-x-1 mt-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">LEADING</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
