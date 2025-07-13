"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Sun,
  Wind,
  Droplets,
  Zap,
  MapPin,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Factory,
  Flame,
  Truck,
  Plus,
  X,
} from "lucide-react";
import {
  energyDataService,
  type EnergyBlock,
  type GridData,
} from "@/lib/energy-data";
import { useAuth, hasPermission } from "@/lib/auth-context";
import { autoBiddingEngine } from "@/lib/auto-bidding";
import { useWatchlist } from "@/lib/use-watchlist";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Import useMapEvents hook and Leaflet types
import { useMapEvents } from "react-leaflet";
import type { DivIcon } from "leaflet";

// Real-time energy data will be fetched from the service

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
      return "text-green-600 bg-green-100";
    case "bidding":
      return "text-orange-600 bg-orange-100";
    case "sold":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-blue-600 bg-blue-100";
  }
};

export function EnergyMap() {
  const [selectedBlock, setSelectedBlock] = useState<EnergyBlock | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [energyData, setEnergyData] = useState<EnergyBlock[]>([]);
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [newListingLocation, setNewListingLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Auth context
  const { user } = useAuth();
  const canCreateListings = user && hasPermission(user, "create_listings");

  // Watchlist functionality
  const {
    addToWatchlist,
    removeFromWatchlist,
    isWatching,
    loading: watchlistLoading,
  } = useWatchlist();

  // New listing form state
  const [newListing, setNewListing] = useState({
    location: "",
    type: "",
    facilityType: "",
    available: "",
    price: "",
    duration: "",
    description: "",
    minBid: "",
    behindTheFence: false,
  });

  // Fetch real energy data
  const fetchEnergyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [blocks, grid] = await Promise.all([
        energyDataService.getAllEnergyBlocks(),
        energyDataService.getGridData(),
      ]);

      setEnergyData(blocks);
      setGridData(grid);
      setLastUpdated(new Date());

      // Update auto-bidding engine with new market data
      if (user?.userType === "consumer") {
        autoBiddingEngine.updateMarketAnalytics(blocks);
        autoBiddingEngine.checkPriceAlerts(blocks);

        // Evaluate for auto-bidding if engine is running
        if (autoBiddingEngine.isRunning()) {
          const bidResults =
            await autoBiddingEngine.evaluateEnergyBlocks(blocks);
          if (bidResults.length > 0) {
            console.log("🤖 Auto-bidding results:", bidResults);
          }
        }
      }
    } catch (err) {
      setError("Failed to fetch real-time energy data. Using fallback data.");
      console.error("Energy data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    fetchEnergyData();

    // Setup Leaflet icons for client-side only
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Fix Leaflet default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xIDIgNSA1LjEgNSA5YzAgNS4yIDcgMTMgNyAxM3M3LTcuOCA3LTEzYzAtMy45LTMuMS03LTctN3oiIGZpbGw9IiMzQjgyRjYiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI5IiByPSIyLjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=",
          shadowUrl:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGVsbGlwc2UgY3g9IjIwIiBjeT0iMzgiIHJ4PSIxNSIgcnk9IjIiIGZpbGw9InJnYmEoMCwwLDAsMC4yKSIvPgo8L3N2Zz4K",
        });
        setLeafletLoaded(true);
      });
    }

    // Request notification permissions for alerts
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      user?.userType === "consumer"
    ) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log("🔔 Notification permission:", permission);
        });
      }
    }

    // Auto-refresh data every 5 minutes
    const interval = setInterval(fetchEnergyData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEnergyData, user]);

  const handleRefresh = () => {
    energyDataService.refreshData();
    fetchEnergyData();
  };

  const handleMapClick = (e: any) => {
    if (isCreatingListing && canCreateListings) {
      const { lat, lng } = e.latlng;
      setNewListingLocation({ lat, lng });
      setShowCreateForm(true);
      setIsCreatingListing(false);
    }
  };

  const handleCreateListing = async () => {
    if (!newListingLocation || !user) return;

    const energyBlock: EnergyBlock = {
      id: `user-${Date.now()}`,
      location: newListing.location,
      type: newListing.type as any,
      available: Number.parseFloat(newListing.available),
      price: Number.parseFloat(newListing.price) / 1000, // Convert to $/kWh
      coordinates: newListingLocation,
      status: "available",
      producer: user.company,
      timeRemaining: newListing.duration,
      gridOperator: "OTHER",
      facilityType: newListing.facilityType as any,
      behindTheFence: newListing.behindTheFence,
      proximityRadius: newListing.behindTheFence ? 5 : undefined,
      industrialSpecs: newListing.behindTheFence
        ? {
            voltage: "480V",
            frequency: 60,
            reliability: 99.5,
            minimumContract: 12,
            maxCapacity: Number.parseFloat(newListing.available),
          }
        : undefined,
    };

    // Add to current energy data
    setEnergyData((prev) => [...prev, energyBlock]);

    // Reset form
    setNewListing({
      location: "",
      type: "",
      facilityType: "",
      available: "",
      price: "",
      duration: "",
      description: "",
      minBid: "",
      behindTheFence: false,
    });
    setNewListingLocation(null);
    setShowCreateForm(false);
  };

  const toggleCreateMode = () => {
    setIsCreatingListing(!isCreatingListing);
    if (isCreatingListing) {
      setNewListingLocation(null);
    }
  };

  if (!isClient) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span>Real-Time Excess Energy Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-dashed border-green-300 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Loading Interactive Map...
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Map click handler component
  function MapClickHandler() {
    useMapEvents({
      click(e: any) {
        if (isCreatingListing && canCreateListings) {
          const { lat, lng } = e.latlng;
          setNewListingLocation({ lat, lng });
          setShowCreateForm(true);
          setIsCreatingListing(false);
        }
      },
    });
    return null;
  }

  // Create custom div icon helper
  const createCustomIcon = (emoji: string, color: string): DivIcon | null => {
    if (typeof window === "undefined" || !leafletLoaded) return null;

    // Dynamically import Leaflet to create icon
    const L = require("leaflet");
    return L.divIcon({
      html: `<div style="background: ${color}; border: 2px solid #ffffff; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 14px;">${emoji}</div>`,
      className: "custom-div-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <div className="space-y-6">
      {/* Grid Data Summary */}
      {gridData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Grid Demand
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {(gridData.demand / 1000).toFixed(1)} GW
                  </p>
                </div>
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Renewable Supply
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {(gridData.supply / 1000).toFixed(1)} GW
                  </p>
                </div>
                <Sun className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Price</p>
                  <p className="text-xl font-bold text-orange-600">
                    ${gridData.priceRange.avg.toFixed(0)}/MWh
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Curtailment
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {gridData.curtailment.toFixed(0)} MW
                  </p>
                </div>
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span>Real-Time Excess Energy Map</span>
              {loading && (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              {error && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Fallback Data
                </Badge>
              )}
              {lastUpdated && (
                <Badge variant="secondary" className="text-xs">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </Badge>
              )}
              {canCreateListings && (
                <Button
                  size="sm"
                  variant={isCreatingListing ? "destructive" : "default"}
                  onClick={toggleCreateMode}
                  className="flex items-center space-x-1"
                >
                  {isCreatingListing ? (
                    <>
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Create Listing</span>
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Create Mode Instructions */}
          {isCreatingListing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Create Energy Listing Mode: Click anywhere on the map to drop
                  a pin and create a new energy offering.
                </span>
              </div>
            </div>
          )}

          <div className="h-96 rounded-lg overflow-hidden relative">
            <MapContainer
              center={[37.7749, -96.0]}
              zoom={4}
              style={{ height: "100%", width: "100%" }}
              className={`rounded-lg ${isCreatingListing ? "cursor-crosshair" : ""}`}
            >
              <MapClickHandler />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Show new listing pin if in create mode and location selected */}
              {newListingLocation && (
                <Marker
                  position={[newListingLocation.lat, newListingLocation.lng]}
                  icon={L?.divIcon({
                    html: `<div style="background: #10B981; border: 2px solid #ffffff; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 16px;">📍</div>`,
                    className: "custom-div-icon",
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-green-600">
                        New Energy Listing
                      </h3>
                      <p className="text-sm text-gray-600">
                        Click to configure details
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {energyData.map((block) => {
                // Get emoji and color based on energy type and facility
                const getMarkerEmoji = (block: EnergyBlock) => {
                  if (block.behindTheFence) return "🏭"; // Industrial behind-the-fence

                  switch (block.type) {
                    case "Solar":
                      return "☀️";
                    case "Wind":
                      return "💨";
                    case "Hydro":
                      return "💧";
                    case "Natural Gas":
                      return "🔥";
                    case "Cogeneration":
                      return "⚡";
                    case "Industrial Steam":
                      return "🏭";
                    case "LNG":
                      return "🚛";
                    default:
                      return "⚡";
                  }
                };

                const getMarkerColor = (block: EnergyBlock) => {
                  if (block.curtailed) return "#EF4444"; // Red for curtailed
                  if (block.behindTheFence) return "#F59E0B"; // Amber for behind-the-fence

                  switch (block.facilityType) {
                    case "Renewable":
                      return "#10B981"; // Green for renewable
                    case "Refinery":
                      return "#DC2626"; // Red for refineries
                    case "Chemical Plant":
                      return "#7C3AED"; // Purple for chemical
                    case "LNG Terminal":
                      return "#F59E0B"; // Amber for LNG
                    default:
                      return "#3B82F6"; // Blue default
                  }
                };

                const emoji = getMarkerEmoji(block);
                const color = getMarkerColor(block);

                return (
                  <Marker
                    key={block.id}
                    position={[block.coordinates.lat, block.coordinates.lng]}
                    icon={L?.divIcon({
                      html: `<div style="background: ${color}; border: 2px solid #ffffff; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 14px;">${emoji}</div>`,
                      className: "custom-div-icon",
                      iconSize: [30, 30],
                      iconAnchor: [15, 15],
                    })}
                    eventHandlers={{
                      click: () =>
                        !isCreatingListing && setSelectedBlock(block),
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-48">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">{block.location}</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Type:</span>{" "}
                            {block.type}
                          </p>
                          <p>
                            <span className="font-medium">Facility:</span>{" "}
                            {block.facilityType}
                          </p>
                          <p>
                            <span className="font-medium">Available:</span>{" "}
                            {block.available.toFixed(1)} MWh
                          </p>
                          <p>
                            <span className="font-medium">Price:</span>
                            <span
                              className={
                                block.price < 0
                                  ? "text-green-600 font-bold"
                                  : "text-blue-600 font-bold"
                              }
                            >
                              ${block.price.toFixed(3)}/kWh
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Grid:</span>{" "}
                            {block.gridOperator}
                          </p>
                          <p>
                            <span className="font-medium">Producer:</span>{" "}
                            {block.producer}
                          </p>
                          {block.behindTheFence && (
                            <Badge
                              variant="secondary"
                              className="bg-orange-100 text-orange-800 text-xs mt-1"
                            >
                              🏭 Behind-the-Fence (On-site Power)
                            </Badge>
                          )}
                          {block.curtailed && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 text-xs mt-1"
                            >
                              🔄 Curtailed Energy
                            </Badge>
                          )}
                          {block.proximityRadius && (
                            <p>
                              <span className="font-medium">Range:</span>{" "}
                              {block.proximityRadius}km radius
                            </p>
                          )}
                          {block.industrialSpecs && (
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                              <p>
                                <strong>Industrial Specs:</strong>
                              </p>
                              <p>• Voltage: {block.industrialSpecs.voltage}</p>
                              <p>
                                • Reliability:{" "}
                                {block.industrialSpecs.reliability.toFixed(1)}%
                              </p>
                              <p>
                                • Min Contract:{" "}
                                {block.industrialSpecs.minimumContract}h
                              </p>
                            </div>
                          )}
                          {block.timeRemaining && (
                            <p>
                              <span className="font-medium">Time Left:</span>{" "}
                              {block.timeRemaining}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={`mt-2 ${getStatusColor(block.status)}`}
                        >
                          {block.status.toUpperCase()}
                        </Badge>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Map Controls */}
          <div className="flex flex-wrap gap-2 mt-4">
            {/* Renewable Energy Sources */}
            <Badge
              variant="outline"
              className="border-yellow-300 text-yellow-700 cursor-pointer hover:bg-yellow-50"
            >
              <Sun className="h-3 w-3 mr-1" />
              Solar ({energyData.filter((b) => b.type === "Solar").length})
            </Badge>
            <Badge
              variant="outline"
              className="border-blue-300 text-blue-700 cursor-pointer hover:bg-blue-50"
            >
              <Wind className="h-3 w-3 mr-1" />
              Wind ({energyData.filter((b) => b.type === "Wind").length})
            </Badge>
            <Badge
              variant="outline"
              className="border-cyan-300 text-cyan-700 cursor-pointer hover:bg-cyan-50"
            >
              <Droplets className="h-3 w-3 mr-1" />
              Hydro ({energyData.filter((b) => b.type === "Hydro").length})
            </Badge>

            {/* Industrial Energy Sources */}
            <Badge
              variant="outline"
              className="border-red-300 text-red-700 cursor-pointer hover:bg-red-50"
            >
              <Factory className="h-3 w-3 mr-1" />
              Refineries (
              {energyData.filter((b) => b.facilityType === "Refinery").length})
            </Badge>
            <Badge
              variant="outline"
              className="border-purple-300 text-purple-700 cursor-pointer hover:bg-purple-50"
            >
              <Flame className="h-3 w-3 mr-1" />
              Chemical (
              {
                energyData.filter((b) => b.facilityType === "Chemical Plant")
                  .length
              }
              )
            </Badge>
            <Badge
              variant="outline"
              className="border-orange-300 text-orange-700 cursor-pointer hover:bg-orange-50"
            >
              <Truck className="h-3 w-3 mr-1" />
              LNG (
              {
                energyData.filter((b) => b.facilityType === "LNG Terminal")
                  .length
              }
              )
            </Badge>

            {/* Behind-the-Fence Indicator */}
            <Badge variant="outline" className="border-gray-400 text-gray-600">
              🏭 Behind-Fence (
              {energyData.filter((b) => b.behindTheFence).length})
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Selected Energy Block Details */}
      {selectedBlock && (
        <Card className="bg-white/60 backdrop-blur-sm border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {(() => {
                  const IconComponent = getEnergyIcon(selectedBlock.type);
                  return <IconComponent className="h-5 w-5 text-green-600" />;
                })()}
                <span>{selectedBlock.location}</span>
              </div>
              <Badge className={getStatusColor(selectedBlock.status)}>
                {selectedBlock.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Available Energy
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {selectedBlock.available.toFixed(1)} MWh
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Price per kWh
                </p>
                <p
                  className={`text-lg font-bold ${selectedBlock.price < 0 ? "text-green-600" : "text-blue-600"}`}
                >
                  ${selectedBlock.price.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Grid Operator
                </p>
                <p className="text-lg font-bold text-purple-600">
                  {selectedBlock.gridOperator}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Time Remaining
                </p>
                <p className="text-lg font-bold text-orange-600">
                  {selectedBlock.timeRemaining || "N/A"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Producer</p>
              <p className="text-lg font-bold text-gray-700">
                {selectedBlock.producer}
              </p>
              {selectedBlock.curtailed && (
                <Badge className="bg-yellow-100 text-yellow-800 mt-2">
                  ⚡ Curtailed Surplus Energy - Negative Pricing
                </Badge>
              )}
            </div>

            {selectedBlock.status === "available" && (
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Navigate to live bidding interface for this energy block
                    const biddingTab = document.querySelector(
                      '[value="bidding"]',
                    ) as HTMLElement;
                    if (biddingTab) {
                      biddingTab.click();
                    }
                    // Show success notification
                    if (
                      typeof window !== "undefined" &&
                      Notification.permission === "granted"
                    ) {
                      new Notification("Navigating to Bidding! 🎯", {
                        body: `Opening live bidding interface for ${selectedBlock.location}`,
                        icon: "⚡",
                      });
                    }
                  }}
                >
                  Place Bid
                </Button>
                {isWatching(selectedBlock.id) ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => removeFromWatchlist(selectedBlock.id)}
                    disabled={watchlistLoading}
                  >
                    Remove from Watchlist
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => addToWatchlist(selectedBlock)}
                    disabled={watchlistLoading}
                  >
                    Watch Energy Block
                  </Button>
                )}
              </div>
            )}

            {selectedBlock.status === "bidding" && (
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Navigate to live bidding interface for this energy block
                    const biddingTab = document.querySelector(
                      '[value="bidding"]',
                    ) as HTMLElement;
                    if (biddingTab) {
                      biddingTab.click();
                    }
                    // Show success notification
                    if (
                      typeof window !== "undefined" &&
                      Notification.permission === "granted"
                    ) {
                      new Notification("Viewing Live Bids! 📊", {
                        body: `Opening live bidding interface for ${selectedBlock.location}`,
                        icon: "⚡",
                      });
                    }
                  }}
                >
                  View Current Bids
                </Button>
                {isWatching(selectedBlock.id) ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => removeFromWatchlist(selectedBlock.id)}
                    disabled={watchlistLoading}
                  >
                    Remove from Watchlist
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => addToWatchlist(selectedBlock)}
                    disabled={watchlistLoading}
                  >
                    Watch Energy Block
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Energy Listing Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Energy Listing</DialogTitle>
            <DialogDescription>
              Configure your energy offering details to open bidding to the
              marketplace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location Name</Label>
                <Input
                  id="location"
                  placeholder="e.g. Solar Farm Alpha"
                  value={newListing.location}
                  onChange={(e) =>
                    setNewListing((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="type">Energy Type</Label>
                <Select
                  value={newListing.type}
                  onValueChange={(value) =>
                    setNewListing((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solar">Solar</SelectItem>
                    <SelectItem value="Wind">Wind</SelectItem>
                    <SelectItem value="Hydro">Hydro</SelectItem>
                    <SelectItem value="Natural Gas">Natural Gas</SelectItem>
                    <SelectItem value="Cogeneration">Cogeneration</SelectItem>
                    <SelectItem value="Industrial Steam">
                      Industrial Steam
                    </SelectItem>
                    <SelectItem value="LNG">LNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facilityType">Facility Type</Label>
                <Select
                  value={newListing.facilityType}
                  onValueChange={(value) =>
                    setNewListing((prev) => ({ ...prev, facilityType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Renewable">Renewable Plant</SelectItem>
                    <SelectItem value="Refinery">Oil Refinery</SelectItem>
                    <SelectItem value="Chemical Plant">
                      Chemical Plant
                    </SelectItem>
                    <SelectItem value="LNG Terminal">LNG Terminal</SelectItem>
                    <SelectItem value="Industrial Complex">
                      Industrial Complex
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="available">Available Energy (MWh)</Label>
                <Input
                  id="available"
                  type="number"
                  placeholder="25.5"
                  value={newListing.available}
                  onChange={(e) =>
                    setNewListing((prev) => ({
                      ...prev,
                      available: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Starting Price ($/MWh)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="45.00"
                  value={newListing.price}
                  onChange={(e) =>
                    setNewListing((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="duration">Auction Duration</Label>
                <Select
                  value={newListing.duration}
                  onValueChange={(value) =>
                    setNewListing((prev) => ({ ...prev, duration: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="2h">2 hours</SelectItem>
                    <SelectItem value="4h">4 hours</SelectItem>
                    <SelectItem value="8h">8 hours</SelectItem>
                    <SelectItem value="12h">12 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional details about this energy offering..."
                value={newListing.description}
                onChange={(e) =>
                  setNewListing((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="behindTheFence"
                checked={newListing.behindTheFence}
                onChange={(e) =>
                  setNewListing((prev) => ({
                    ...prev,
                    behindTheFence: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="behindTheFence" className="text-sm">
                Behind-the-fence power (On-site consumption only)
              </Label>
            </div>

            {newListingLocation && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                <strong>Location:</strong> {newListingLocation.lat.toFixed(4)},{" "}
                {newListingLocation.lng.toFixed(4)}
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button
                onClick={handleCreateListing}
                className="flex-1"
                disabled={
                  !newListing.location ||
                  !newListing.type ||
                  !newListing.available ||
                  !newListing.price
                }
              >
                Create Listing
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
