"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Search,
  Filter,
  DollarSign,
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  RefreshCw,
  Volume2,
  VolumeX
} from "lucide-react";
import { useMarketNotifications, type WebSocketEvent, type BidUpdate, type PriceAlert } from "@/lib/use-websocket";
import { formatDistanceToNow } from "date-fns";

export function LiveNotifications() {
  const { notifications, isConnected } = useMarketNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio notification for new events
  const playNotificationSound = () => {
    if (soundEnabled && typeof window !== "undefined") {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        console.log("Audio notification not available");
      }
    }
  };

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Filter by type
      if (filterType !== "all" && notification.type !== filterType) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        let searchableText = "";

        switch (notification.type) {
          case "bid_update":
            const bidData = notification.data as BidUpdate;
            searchableText = `${bidData.bidder} ${bidData.bidderType} ${bidData.auctionId}`.toLowerCase();
            break;
          case "price_alert":
            const alertData = notification.data as PriceAlert;
            searchableText = `${alertData.location} ${alertData.alertType}`.toLowerCase();
            break;
          default:
            searchableText = JSON.stringify(notification.data).toLowerCase();
        }

        return searchableText.includes(searchLower);
      }

      return true;
    });
  }, [notifications, filterType, searchQuery]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "bid_update":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "price_alert":
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      case "auction_start":
        return <Zap className="h-4 w-4 text-green-600" />;
      case "auction_end":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "system_notification":
        return <Bell className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "bid_update":
        return "border-l-blue-500 bg-blue-50";
      case "price_alert":
        return "border-l-orange-500 bg-orange-50";
      case "auction_start":
        return "border-l-green-500 bg-green-50";
      case "auction_end":
        return "border-l-gray-500 bg-gray-50";
      case "system_notification":
        return "border-l-purple-500 bg-purple-50";
      default:
        return "border-l-red-500 bg-red-50";
    }
  };

  const renderNotificationContent = (notification: WebSocketEvent) => {
    switch (notification.type) {
      case "bid_update":
        const bidData = notification.data as BidUpdate;
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">New Bid Placed</h4>
              <Badge variant="outline" className="text-xs">{bidData.bidderType}</Badge>
            </div>
            <p className="text-sm text-gray-600">
              <strong>{bidData.bidder}</strong> bid <strong className="text-blue-600">${bidData.price.toFixed(3)}/kWh</strong> for {bidData.amount.toFixed(1)} MWh
            </p>
            <p className="text-xs text-gray-500">Auction ID: {bidData.auctionId}</p>
          </div>
        );

      case "price_alert":
        const alertData = notification.data as PriceAlert;
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Price Alert</h4>
              <Badge variant="outline" className={`text-xs ${alertData.alertType === 'below' ? 'text-green-600' : 'text-red-600'}`}>
                {alertData.alertType.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              <strong>{alertData.location}</strong> is now <strong className="text-orange-600">${alertData.currentPrice.toFixed(3)}/kWh</strong>
            </p>
            <p className="text-xs text-gray-500">Threshold: ${alertData.threshold.toFixed(3)}/kWh</p>
          </div>
        );

      case "auction_start":
      case "auction_end":
        return (
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">
              {notification.type === "auction_start" ? "Auction Started" : "Auction Ended"}
            </h4>
            <p className="text-sm text-gray-600">
              {JSON.stringify(notification.data)}
            </p>
          </div>
        );

      case "system_notification":
        const systemData = notification.data as { message: string };
        return (
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">System Update</h4>
            <p className="text-sm text-gray-600">{systemData.message}</p>
          </div>
        );

      default:
        return (
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">Unknown Event</h4>
            <p className="text-sm text-gray-600">{JSON.stringify(notification.data)}</p>
          </div>
        );
    }
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span>Live Market Notifications</span>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Live
              </Badge>
            ) : (
              <Badge variant="destructive">
                Disconnected
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 w-8 p-0"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Badge variant="secondary" className="text-xs">
              {filteredNotifications.length} alerts
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bid_update">Bid Updates</SelectItem>
              <SelectItem value="price_alert">Price Alerts</SelectItem>
              <SelectItem value="auction_start">Auction Start</SelectItem>
              <SelectItem value="auction_end">Auction End</SelectItem>
              <SelectItem value="system_notification">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {notifications.length === 0
                    ? "No notifications yet. Live updates will appear here."
                    : "No notifications match your filter criteria."
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <div
                  key={`${notification.timestamp.getTime()}-${index}`}
                  className={`border-l-4 p-4 rounded-lg ${getNotificationColor(notification.type)} hover:bg-opacity-70 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        {renderNotificationContent(notification)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-lg font-bold text-blue-600">{notifications.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Bids</p>
            <p className="text-lg font-bold text-green-600">
              {notifications.filter(n => n.type === "bid_update").length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Alerts</p>
            <p className="text-lg font-bold text-orange-600">
              {notifications.filter(n => n.type === "price_alert").length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
