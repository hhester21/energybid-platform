"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Plus,
  Settings,
  Bell,
  TrendingUp,
  Target,
  DollarSign,
  Clock,
  Zap,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  Edit3,
  BarChart3
} from "lucide-react";
import {
  autoBiddingEngine,
  type AutoBidRule,
  type PriceAlert,
  type BiddingStrategy,
  type AlertType,
  type MarketAnalytics
} from "@/lib/auto-bidding";
import { useAuth } from "@/lib/auth-context";

const energyTypes = ["Solar", "Wind", "Hydro", "Natural Gas", "Cogeneration", "Industrial Steam", "LNG"];

const strategyInfo = {
  conservative: {
    name: "Conservative",
    description: "Minimal bid increments, focus on value",
    color: "bg-blue-100 text-blue-800"
  },
  balanced: {
    name: "Balanced",
    description: "Moderate bidding, good success rate",
    color: "bg-green-100 text-green-800"
  },
  aggressive: {
    name: "Aggressive",
    description: "Higher bids, maximum winning chance",
    color: "bg-orange-100 text-orange-800"
  },
  custom: {
    name: "AI-Powered",
    description: "Market analysis driven bidding",
    color: "bg-purple-100 text-purple-800"
  }
};

const alertTypeInfo = {
  price_drop: { name: "Price Drop", icon: TrendingUp, color: "text-green-600" },
  new_listing: { name: "New Listing", icon: Plus, color: "text-blue-600" },
  auction_ending: { name: "Auction Ending", icon: Clock, color: "text-orange-600" },
  outbid: { name: "Outbid", icon: AlertTriangle, color: "text-red-600" },
  won_bid: { name: "Won Bid", icon: Target, color: "text-green-600" }
};

export function AutoBiddingManager() {
  const { user } = useAuth();
  const [rules, setRules] = useState<AutoBidRule[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [stats, setStats] = useState(autoBiddingEngine.getStats());
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoBidRule | null>(null);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);

  // New rule form state
  const [newRule, setNewRule] = useState({
    name: "",
    strategy: "balanced" as BiddingStrategy,
    maxPrice: "",
    minEnergy: "",
    energyTypes: [] as string[],
    bidIncrement: "",
    maxAttempts: "3",
    autoOutbid: true,
    bidTiming: "strategic" as "immediate" | "strategic" | "last_minute",
    dailyBudget: "",
    maxBidsPerHour: "5",
    behindTheFence: false
  });

  // New alert form state
  const [newAlert, setNewAlert] = useState({
    name: "",
    type: "price_drop" as AlertType,
    targetPrice: "",
    energyTypes: [] as string[],
    email: true,
    browser: true
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setRules(autoBiddingEngine.getBidRules());
    setAlerts(autoBiddingEngine.getPriceAlerts());
    setIsEngineRunning(autoBiddingEngine.isRunning());
    setStats(autoBiddingEngine.getStats());
  };

  const handleCreateRule = () => {
    const rule = autoBiddingEngine.addBidRule({
      name: newRule.name,
      enabled: true,
      strategy: newRule.strategy,
      conditions: {
        maxPrice: Number.parseFloat(newRule.maxPrice),
        minEnergy: Number.parseFloat(newRule.minEnergy),
        energyTypes: newRule.energyTypes,
        behindTheFence: newRule.behindTheFence
      },
      actions: {
        bidIncrement: Number.parseFloat(newRule.bidIncrement),
        maxAttempts: Number.parseInt(newRule.maxAttempts),
        autoOutbid: newRule.autoOutbid,
        bidTiming: newRule.bidTiming
      },
      limits: {
        dailyBudget: Number.parseFloat(newRule.dailyBudget),
        maxBidsPerHour: Number.parseInt(newRule.maxBidsPerHour),
        pauseAfterWin: false
      }
    });

    // Reset form
    setNewRule({
      name: "",
      strategy: "balanced",
      maxPrice: "",
      minEnergy: "",
      energyTypes: [],
      bidIncrement: "",
      maxAttempts: "3",
      autoOutbid: true,
      bidTiming: "strategic",
      dailyBudget: "",
      maxBidsPerHour: "5",
      behindTheFence: false
    });

    setShowCreateRule(false);
    loadData();
  };

  const handleCreateAlert = () => {
    const alert = autoBiddingEngine.addPriceAlert({
      name: newAlert.name,
      enabled: true,
      type: newAlert.type,
      conditions: {
        targetPrice: newAlert.targetPrice ? Number.parseFloat(newAlert.targetPrice) : undefined,
        energyTypes: newAlert.energyTypes
      },
      notifications: {
        email: newAlert.email,
        browser: newAlert.browser
      }
    });

    // Reset form
    setNewAlert({
      name: "",
      type: "price_drop",
      targetPrice: "",
      energyTypes: [],
      email: true,
      browser: true
    });

    setShowCreateAlert(false);
    loadData();
  };

  const toggleEngine = () => {
    if (isEngineRunning) {
      autoBiddingEngine.stop();
    } else {
      autoBiddingEngine.start();
    }
    setIsEngineRunning(autoBiddingEngine.isRunning());
  };

  const toggleRule = (id: string, enabled: boolean) => {
    autoBiddingEngine.updateBidRule(id, { enabled });
    loadData();
  };

  const toggleAlert = (id: string, enabled: boolean) => {
    autoBiddingEngine.updatePriceAlert(id, { enabled });
    loadData();
  };

  const deleteRule = (id: string) => {
    autoBiddingEngine.deleteBidRule(id);
    loadData();
  };

  const deleteAlert = (id: string) => {
    autoBiddingEngine.deletePriceAlert(id);
    loadData();
  };

  if (!user || user.userType !== "consumer") {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Auto-Bidding for Energy Consumers</h3>
          <p className="text-gray-500">Switch to Consumer user type to access automated bidding features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engine Status & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Engine Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isEngineRunning ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="font-bold">{isEngineRunning ? "Running" : "Stopped"}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant={isEngineRunning ? "destructive" : "default"}
                onClick={toggleEngine}
              >
                {isEngineRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeRules}</p>
              </div>
              <Bot className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activeAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Market Types</p>
                <p className="text-2xl font-bold text-purple-600">{stats.marketDataTypes.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="rules">Bidding Rules</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
        </TabsList>

        {/* Bidding Rules Tab */}
        <TabsContent value="rules" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <span>Automated Bidding Rules</span>
                  </CardTitle>
                  <CardDescription>Configure strategies for automatic bid placement</CardDescription>
                </div>
                <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Bidding Rule</DialogTitle>
                      <DialogDescription>Set up automated bidding parameters and limits</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          placeholder="e.g. Solar Energy Hunter"
                          value={newRule.name}
                          onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="strategy">Bidding Strategy</Label>
                        <Select
                          value={newRule.strategy}
                          onValueChange={(value: BiddingStrategy) => setNewRule(prev => ({ ...prev, strategy: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(strategyInfo).map(([key, info]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center space-x-2">
                                  <span>{info.name}</span>
                                  <Badge className={info.color} variant="secondary">{info.description}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="max-price">Max Price ($/kWh)</Label>
                          <Input
                            id="max-price"
                            type="number"
                            step="0.001"
                            placeholder="0.050"
                            value={newRule.maxPrice}
                            onChange={(e) => setNewRule(prev => ({ ...prev, maxPrice: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="min-energy">Min Energy (MWh)</Label>
                          <Input
                            id="min-energy"
                            type="number"
                            placeholder="10"
                            value={newRule.minEnergy}
                            onChange={(e) => setNewRule(prev => ({ ...prev, minEnergy: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Energy Types</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {energyTypes.map(type => (
                            <label key={type} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newRule.energyTypes.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRule(prev => ({ ...prev, energyTypes: [...prev.energyTypes, type] }));
                                  } else {
                                    setNewRule(prev => ({ ...prev, energyTypes: prev.energyTypes.filter(t => t !== type) }));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bid-increment">Bid Increment ($/kWh)</Label>
                          <Input
                            id="bid-increment"
                            type="number"
                            step="0.001"
                            placeholder="0.005"
                            value={newRule.bidIncrement}
                            onChange={(e) => setNewRule(prev => ({ ...prev, bidIncrement: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="daily-budget">Daily Budget ($)</Label>
                          <Input
                            id="daily-budget"
                            type="number"
                            placeholder="1000"
                            value={newRule.dailyBudget}
                            onChange={(e) => setNewRule(prev => ({ ...prev, dailyBudget: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newRule.autoOutbid}
                          onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, autoOutbid: checked }))}
                        />
                        <Label>Automatically outbid competitors</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newRule.behindTheFence}
                          onCheckedChange={(checked) => setNewRule(prev => ({ ...prev, behindTheFence: checked }))}
                        />
                        <Label>Prefer behind-the-fence (on-site) power</Label>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          onClick={handleCreateRule}
                          className="flex-1"
                          disabled={!newRule.name || !newRule.maxPrice || !newRule.minEnergy}
                        >
                          Create Rule
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreateRule(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Bidding Rules</h3>
                    <p className="text-gray-500 mb-4">Create your first automated bidding rule to get started.</p>
                    <Button onClick={() => setShowCreateRule(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Rule
                    </Button>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                          />
                          <div>
                            <h3 className="font-semibold">{rule.name}</h3>
                            <Badge className={strategyInfo[rule.strategy].color} variant="secondary">
                              {strategyInfo[rule.strategy].name}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteRule(rule.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Max Price</p>
                          <p className="font-medium">${rule.conditions.maxPrice}/kWh</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Min Energy</p>
                          <p className="font-medium">{rule.conditions.minEnergy} MWh</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Daily Budget</p>
                          <p className="font-medium">${rule.limits.dailyBudget}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Triggered</p>
                          <p className="font-medium">
                            {rule.lastTriggered ? rule.lastTriggered.toLocaleDateString() : "Never"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Energy Types:</p>
                        <div className="flex flex-wrap gap-1">
                          {rule.conditions.energyTypes.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-orange-600" />
                    <span>Price Alerts</span>
                  </CardTitle>
                  <CardDescription>Get notified when market conditions meet your criteria</CardDescription>
                </div>
                <Dialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Alert
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Price Alert</DialogTitle>
                      <DialogDescription>Set conditions for market notifications</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="alert-name">Alert Name</Label>
                        <Input
                          id="alert-name"
                          placeholder="e.g. Cheap Solar Alert"
                          value={newAlert.name}
                          onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="alert-type">Alert Type</Label>
                        <Select
                          value={newAlert.type}
                          onValueChange={(value: AlertType) => setNewAlert(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select alert type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(alertTypeInfo).map(([key, info]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center space-x-2">
                                  <info.icon className={`h-4 w-4 ${info.color}`} />
                                  <span>{info.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="target-price">Target Price ($/kWh)</Label>
                        <Input
                          id="target-price"
                          type="number"
                          step="0.001"
                          placeholder="0.025"
                          value={newAlert.targetPrice}
                          onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Energy Types</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {energyTypes.map(type => (
                            <label key={type} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newAlert.energyTypes.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewAlert(prev => ({ ...prev, energyTypes: [...prev.energyTypes, type] }));
                                  } else {
                                    setNewAlert(prev => ({ ...prev, energyTypes: prev.energyTypes.filter(t => t !== type) }));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label>Notification Methods</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newAlert.browser}
                              onCheckedChange={(checked) => setNewAlert(prev => ({ ...prev, browser: checked }))}
                            />
                            <Label>Browser notifications</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={newAlert.email}
                              onCheckedChange={(checked) => setNewAlert(prev => ({ ...prev, email: checked }))}
                            />
                            <Label>Email notifications</Label>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          onClick={handleCreateAlert}
                          className="flex-1"
                          disabled={!newAlert.name || newAlert.energyTypes.length === 0}
                        >
                          Create Alert
                        </Button>
                        <Button variant="outline" onClick={() => setShowCreateAlert(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Price Alerts</h3>
                    <p className="text-gray-500 mb-4">Create alerts to monitor market opportunities.</p>
                    <Button onClick={() => setShowCreateAlert(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Alert
                    </Button>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const alertInfo = alertTypeInfo[alert.type];
                    const AlertIcon = alertInfo.icon;

                    return (
                      <div key={alert.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Switch
                              checked={alert.enabled}
                              onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                            />
                            <div className="flex items-center space-x-2">
                              <AlertIcon className={`h-5 w-5 ${alertInfo.color}`} />
                              <div>
                                <h3 className="font-semibold">{alert.name}</h3>
                                <Badge variant="outline">{alertInfo.name}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteAlert(alert.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Target Price</p>
                            <p className="font-medium">
                              {alert.conditions.targetPrice ? `$${alert.conditions.targetPrice}/kWh` : "Any"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Triggered</p>
                            <p className="font-medium">{alert.triggeredCount} times</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Last Triggered</p>
                            <p className="font-medium">
                              {alert.lastTriggered ? alert.lastTriggered.toLocaleDateString() : "Never"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Notifications</p>
                            <div className="flex space-x-1">
                              {alert.notifications.browser && <Badge variant="outline" className="text-xs">Browser</Badge>}
                              {alert.notifications.email && <Badge variant="outline" className="text-xs">Email</Badge>}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Energy Types:</p>
                          <div className="flex flex-wrap gap-1">
                            {alert.conditions.energyTypes.map(type => (
                              <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Market Analytics</span>
              </CardTitle>
              <CardDescription>AI-powered market insights for optimized bidding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Market Analytics Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Advanced market analysis with price predictions, competition levels, and optimal bidding recommendations.
                </p>
                <Badge variant="secondary" className="mt-4">AI-Powered Insights</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
