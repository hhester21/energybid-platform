"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  Bell,
  DollarSign,
  Settings,
  Trash2,
  Sun,
  Wind,
  Droplets,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  Factory,
  Truck
} from "lucide-react";
import { useWatchlist, type WatchedBlock } from "@/lib/use-watchlist";
import { formatDistanceToNow } from "date-fns";

export function Watchlist() {
  const {
    watchedBlocks,
    loading,
    isConnected,
    removeFromWatchlist,
    updateWatchSettings,
    clearWatchlist,
    watchlistCount
  } = useWatchlist();

  const [selectedWatch, setSelectedWatch] = useState<WatchedBlock | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  const getEnergyIcon = (type: string) => {
    switch (type) {
      case "Solar":
        return Sun;
      case "Wind":
        return Wind;
      case "Hydro":
        return Droplets;
      case "Natural Gas":
      case "Cogeneration":
        return Flame;
      case "LNG":
        return Truck;
      case "Industrial Steam":
        return Factory;
      default:
        return Zap;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "bidding":
        return "bg-orange-100 text-orange-800";
      case "sold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleUpdateSettings = (watchId: string, field: string, value: any) => {
    const updates: any = {};

    if (field.startsWith("priceAlerts.")) {
      const alertField = field.split(".")[1];
      const currentWatch = watchedBlocks.find(w => w.id === watchId);
      if (currentWatch) {
        updates.priceAlerts = {
          ...currentWatch.priceAlerts,
          [alertField]: value
        };
      }
    } else if (field.startsWith("notifications.")) {
      const notificationField = field.split(".")[1];
      const currentWatch = watchedBlocks.find(w => w.id === watchId);
      if (currentWatch) {
        updates.notifications = {
          ...currentWatch.notifications,
          [notificationField]: value
        };
      }
    }

    updateWatchSettings(watchId, updates);
  };

  if (watchlistCount === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <span>Energy Watchlist</span>
            <Badge variant="secondary" className="ml-auto">
              {watchlistCount} watched
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Watched Energy Blocks</h3>
            <p className="text-gray-500 mb-4">
              Add energy blocks to your watchlist to track price changes and receive real-time notifications.
            </p>
            <div className="text-sm text-gray-400">
              Click "Watch Energy Block" on any energy block to get started.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <span>Energy Watchlist</span>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="destructive">Offline</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {watchlistCount} watched
            </Badge>
            {watchlistCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearWatchlist}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {watchedBlocks.map((watch) => {
              const IconComponent = getEnergyIcon(watch.energyBlock.type);

              return (
                <div
                  key={watch.id}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{watch.energyBlock.location}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{watch.energyBlock.type}</Badge>
                          <Badge className={getStatusColor(watch.energyBlock.status)}>
                            {watch.energyBlock.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog
                        open={settingsDialogOpen && selectedWatch?.id === watch.id}
                        onOpenChange={(open) => {
                          setSettingsDialogOpen(open);
                          if (open) setSelectedWatch(watch);
                          else setSelectedWatch(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Watch Settings</DialogTitle>
                            <DialogDescription>
                              Configure notifications and alerts for {watch.energyBlock.location}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Price Alerts */}
                            <div>
                              <h4 className="text-sm font-semibold mb-3">Price Alerts</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Enable Price Alerts</Label>
                                  <Switch
                                    checked={watch.priceAlerts.enabled}
                                    onCheckedChange={(checked) =>
                                      handleUpdateSettings(watch.id, "priceAlerts.enabled", checked)
                                    }
                                  />
                                </div>

                                {watch.priceAlerts.enabled && (
                                  <>
                                    <div>
                                      <Label className="text-sm">Alert Type</Label>
                                      <Select
                                        value={watch.priceAlerts.type}
                                        onValueChange={(value) =>
                                          handleUpdateSettings(watch.id, "priceAlerts.type", value)
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="below">Below Threshold</SelectItem>
                                          <SelectItem value="above">Above Threshold</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-sm">Threshold Price ($/kWh)</Label>
                                      <Input
                                        type="number"
                                        step="0.001"
                                        value={watch.priceAlerts.threshold}
                                        onChange={(e) =>
                                          handleUpdateSettings(
                                            watch.id,
                                            "priceAlerts.threshold",
                                            Number.parseFloat(e.target.value)
                                          )
                                        }
                                        placeholder="0.015"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <Separator />

                            {/* Notification Settings */}
                            <div>
                              <h4 className="text-sm font-semibold mb-3">Notifications</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Price Changes</Label>
                                  <Switch
                                    checked={watch.notifications.priceChanges}
                                    onCheckedChange={(checked) =>
                                      handleUpdateSettings(watch.id, "notifications.priceChanges", checked)
                                    }
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Status Changes</Label>
                                  <Switch
                                    checked={watch.notifications.statusChanges}
                                    onCheckedChange={(checked) =>
                                      handleUpdateSettings(watch.id, "notifications.statusChanges", checked)
                                    }
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Bid Updates</Label>
                                  <Switch
                                    checked={watch.notifications.bidUpdates}
                                    onCheckedChange={(checked) =>
                                      handleUpdateSettings(watch.id, "notifications.bidUpdates", checked)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromWatchlist(watch.energyBlock.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <EyeOff className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Available</p>
                      <p className="font-bold text-blue-600">{watch.energyBlock.available.toFixed(1)} MWh</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current Price</p>
                      <p className={`font-bold flex items-center ${
                        watch.energyBlock.price < 0 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        ${watch.energyBlock.price.toFixed(3)}/kWh
                        {watch.priceAlerts.enabled && (
                          <Bell className="h-3 w-3 ml-1 text-orange-500" />
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Producer</p>
                      <p className="font-medium text-gray-700 text-sm">{watch.energyBlock.producer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Watched Since</p>
                      <p className="font-medium text-gray-700 text-sm">
                        {formatDistanceToNow(watch.watchedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Alerts and Notifications Status */}
                  <div className="flex items-center space-x-4 text-xs">
                    {watch.priceAlerts.enabled && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>
                          Alert {watch.priceAlerts.type} ${watch.priceAlerts.threshold.toFixed(3)}/kWh
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-blue-600">
                      <Bell className="h-3 w-3" />
                      <span>
                        {[
                          watch.notifications.priceChanges && "Price",
                          watch.notifications.statusChanges && "Status",
                          watch.notifications.bidUpdates && "Bids"
                        ].filter(Boolean).join(", ")} notifications
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
