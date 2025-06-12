"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  BellRing,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Zap,
  Clock,
  X,
  Settings,
  Volume2,
  VolumeX,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface Notification {
  id: string;
  type: "price_alert" | "bid_update" | "contract" | "system" | "market_insight" | "auction_ending";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: "trading" | "system" | "billing" | "security";
  actionUrl?: string;
  data?: Record<string, any>;
}

const notificationIcons = {
  price_alert: TrendingDown,
  bid_update: DollarSign,
  contract: Zap,
  system: Info,
  market_insight: TrendingUp,
  auction_ending: Clock
};

const priorityColors = {
  low: "text-gray-600 bg-gray-100",
  medium: "text-blue-600 bg-blue-100",
  high: "text-orange-600 bg-orange-100",
  urgent: "text-red-600 bg-red-100"
};

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Generate sample notifications
    generateSampleNotifications();

    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.85) { // 15% chance every 5 seconds
        addRandomNotification();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateSampleNotifications = () => {
    const sampleNotifications: Notification[] = [
      {
        id: "1",
        type: "price_alert",
        title: "Price Alert Triggered",
        message: "Solar energy price dropped to $0.018/kWh in California - 25% below your target",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: "high",
        category: "trading",
        actionUrl: "/marketplace",
        data: { energyType: "Solar", price: 0.018, location: "California" }
      },
      {
        id: "2",
        type: "bid_update",
        title: "Bid Won!",
        message: "Congratulations! You won the bid for 15 MWh of wind energy at $0.022/kWh",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        priority: "high",
        category: "trading",
        data: { amount: 15, price: 0.022, energyType: "Wind" }
      },
      {
        id: "3",
        type: "auction_ending",
        title: "Auction Ending Soon",
        message: "Texas Wind Farm auction ends in 30 minutes - Current bid: $0.025/kWh",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        priority: "medium",
        category: "trading",
        actionUrl: "/marketplace"
      },
      {
        id: "4",
        type: "contract",
        title: "Smart Contract Executed",
        message: "Energy delivery completed for contract #SC-2024-001. Payment released automatically.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        priority: "medium",
        category: "trading"
      },
      {
        id: "5",
        type: "market_insight",
        title: "AI Market Insight",
        message: "Renewable energy surplus expected to increase 15% this week due to favorable weather conditions",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: false,
        priority: "low",
        category: "trading"
      },
      {
        id: "6",
        type: "system",
        title: "Account Upgrade Available",
        message: "You're eligible for Professional tier with 50% off for the first 3 months",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
        priority: "medium",
        category: "billing"
      },
      {
        id: "7",
        type: "system",
        title: "Security Alert",
        message: "New login detected from San Francisco, CA. If this wasn't you, please secure your account.",
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        read: true,
        priority: "high",
        category: "security"
      }
    ];

    setNotifications(sampleNotifications);
  };

  const addRandomNotification = () => {
    const randomNotifications = [
      {
        type: "price_alert" as const,
        title: "Price Alert",
        message: "Wind energy price increased to $0.028/kWh in Texas",
        priority: "medium" as const,
        category: "trading" as const
      },
      {
        type: "bid_update" as const,
        title: "Bid Outbid",
        message: "You've been outbid on Hydro energy auction. Current bid: $0.019/kWh",
        priority: "medium" as const,
        category: "trading" as const
      },
      {
        type: "market_insight" as const,
        title: "Market Opportunity",
        message: "New behind-the-fence power opportunity detected at chemical plant",
        priority: "low" as const,
        category: "trading" as const
      }
    ];

    const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...randomNotif,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play notification sound if enabled
    if (soundEnabled && typeof window !== "undefined") {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAoUXrTp66hVFApGn+DyvmocBShy0fPTgjMGHm7A7OuURAo=');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio play errors (user interaction required in some browsers)
        });
      } catch (error) {
        // Ignore audio errors
      }
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)));
    setSelectedNotifications([]);
  };

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    const visibleNotifications = getFilteredNotifications();
    setSelectedNotifications(visibleNotifications.map(n => n.id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filter by category
    if (filter !== "all") {
      filtered = filtered.filter(notif => notif.category === filter);
    }

    // Filter by read status
    if (showUnreadOnly) {
      filtered = filtered.filter(notif => !notif.read);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === "urgent" && !n.read).length;

  if (!user) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Notification Center</h3>
          <p className="text-gray-500">Sign in to view your notifications and alerts.</p>
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
            <Bell className="h-6 w-6 text-blue-600" />
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">Stay updated with real-time alerts and market notifications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {urgentCount > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">
                {urgentCount} urgent notification{urgentCount > 1 ? 's' : ''} require{urgentCount === 1 ? 's' : ''} your attention
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showUnreadOnly}
                  onCheckedChange={setShowUnreadOnly}
                />
                <span className="text-sm">Unread only</span>
              </div>
            </div>
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={deselectAll}>
                  Deselect All
                </Button>
                <Button size="sm" variant="destructive" onClick={deleteSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Notifications</CardTitle>
            <div className="flex space-x-2">
              {getFilteredNotifications().length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const visible = getFilteredNotifications();
                    if (selectedNotifications.length === visible.length) {
                      deselectAll();
                    } else {
                      selectAll();
                    }
                  }}
                >
                  {selectedNotifications.length === getFilteredNotifications().length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getFilteredNotifications().length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search or filters" : "You're all caught up!"}
                </p>
              </div>
            ) : (
              getFilteredNotifications().map((notification) => {
                const IconComponent = notificationIcons[notification.type];
                const isSelected = selectedNotifications.includes(notification.id);

                return (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-1"
                      />
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.read ? 'bg-gray-200' : 'bg-blue-100'
                        }`}>
                          <IconComponent className={`h-5 w-5 ${
                            notification.read ? 'text-gray-600' : 'text-blue-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                {notification.title}
                              </h4>
                              <Badge className={priorityColors[notification.priority]} variant="outline">
                                {notification.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                            </div>
                            <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-400">
                                {notification.timestamp.toLocaleString()}
                              </span>
                              {notification.actionUrl && (
                                <Button size="sm" variant="link" className="p-0 h-auto text-xs">
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <span>Quick Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sound Notifications</h4>
                  <p className="text-sm text-gray-500">Play sound for new notifications</p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Price Alerts</h4>
                  <p className="text-sm text-gray-500">Get notified of price changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Bid Updates</h4>
                  <p className="text-sm text-gray-500">Notifications for bid status changes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Market Insights</h4>
                  <p className="text-sm text-gray-500">AI-powered market analysis alerts</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">System Updates</h4>
                  <p className="text-sm text-gray-500">Platform maintenance and updates</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Notification Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
