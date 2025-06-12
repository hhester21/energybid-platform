import { useEffect, useRef, useState, useCallback } from "react";
import type { EnergyBlock } from "./energy-data";

// WebSocket event types
export interface WebSocketEvent {
  type: "bid_update" | "market_data" | "auction_start" | "auction_end" | "price_alert" | "system_notification";
  timestamp: Date;
  data: unknown;
}

export interface BidUpdate {
  auctionId: string;
  bidder: string;
  amount: number;
  price: number;
  timestamp: Date;
  bidderType: string;
}

export interface MarketDataUpdate {
  energyBlocks: EnergyBlock[];
  gridStatus: {
    demand: number;
    supply: number;
    priceAvg: number;
  };
}

export interface PriceAlert {
  id: string;
  energyBlockId: string;
  location: string;
  threshold: number;
  currentPrice: number;
  alertType: "below" | "above";
}

// WebSocket connection states
type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

export interface UseWebSocketOptions {
  url?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  enableNotifications?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = "wss://api.energybid.com/ws",
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    enableNotifications = true
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventListenersRef = useRef<Map<string, Set<(event: WebSocketEvent) => void>>>(new Map());

  // Request notification permissions
  useEffect(() => {
    if (enableNotifications && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log("🔔 Notification permission:", permission);
        });
      }
    }
  }, [enableNotifications]);

  const showNotification = useCallback((title: string, body: string, icon?: string) => {
    if (enableNotifications && typeof window !== "undefined" && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico"
      });
    }
  }, [enableNotifications]);

  const connect = useCallback(() => {
    try {
      setConnectionState("connecting");
      setError(null);

      // Simulate WebSocket connection (since we don't have a real WebSocket server)
      // In production, this would be: wsRef.current = new WebSocket(url);

      // For demo purposes, we'll simulate a connection
      const simulatedWs = {
        readyState: WebSocket.OPEN,
        send: (data: string) => {
          console.log("📡 Sending WebSocket message:", data);
        },
        close: () => {
          setConnectionState("disconnected");
        },
        addEventListener: (type: string, listener: EventListener) => {
          // Simulate event listeners
        },
        removeEventListener: (type: string, listener: EventListener) => {
          // Simulate event listener removal
        }
      } as unknown as WebSocket;

      wsRef.current = simulatedWs;
      setConnectionState("connected");
      reconnectAttemptsRef.current = 0;

      console.log("🔗 WebSocket connected to", url);

      // Simulate receiving messages
      setTimeout(() => {
        const welcomeEvent: WebSocketEvent = {
          type: "system_notification",
          timestamp: new Date(),
          data: { message: "Welcome to EnergyBid real-time market data!" }
        };
        setLastMessage(welcomeEvent);
        triggerEventListeners("system_notification", welcomeEvent);
      }, 1000);

      // Start simulating market data updates
      startSimulatedUpdates();

    } catch (err) {
      setError(`Connection failed: ${err}`);
      setConnectionState("error");
      handleReconnect();
    }
  }, [url]);

  const startSimulatedUpdates = useCallback(() => {
    // Simulate market data updates every 5 seconds
    const marketDataInterval = setInterval(() => {
      const marketEvent: WebSocketEvent = {
        type: "market_data",
        timestamp: new Date(),
        data: {
          energyBlocks: [], // Would contain updated energy blocks
          gridStatus: {
            demand: Math.random() * 50000 + 30000,
            supply: Math.random() * 45000 + 25000,
            priceAvg: Math.random() * 0.05 + 0.01
          }
        } as MarketDataUpdate
      };
      setLastMessage(marketEvent);
      triggerEventListeners("market_data", marketEvent);
    }, 5000);

    // Simulate bid updates every 10-30 seconds
    const bidUpdateInterval = setInterval(() => {
      const bidEvent: WebSocketEvent = {
        type: "bid_update",
        timestamp: new Date(),
        data: {
          auctionId: `auction_${Math.floor(Math.random() * 10) + 1}`,
          bidder: ["Tesla Supercharger", "Google DeepMind", "CleanSpark Mining"][Math.floor(Math.random() * 3)],
          amount: Math.random() * 20 + 5,
          price: Math.random() * 0.02 + 0.01,
          bidderType: ["EV Charging", "AI Data Center", "BTC Mining"][Math.floor(Math.random() * 3)]
        } as BidUpdate
      };
      setLastMessage(bidEvent);
      triggerEventListeners("bid_update", bidEvent);

      // Show notification for new bids
      const bidData = bidEvent.data as BidUpdate;
      showNotification(
        "New Bid Placed! 🎯",
        `${bidData.bidder} bid $${bidData.price.toFixed(3)}/kWh for ${bidData.amount.toFixed(1)} MWh`,
        "⚡"
      );
    }, Math.random() * 20000 + 10000);

    // Simulate price alerts occasionally
    const alertInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of alert
        const alertEvent: WebSocketEvent = {
          type: "price_alert",
          timestamp: new Date(),
          data: {
            id: `alert_${Date.now()}`,
            energyBlockId: `block_${Math.floor(Math.random() * 10) + 1}`,
            location: ["Mojave Solar Farm", "Roscoe Wind Farm", "Texas LNG Terminal"][Math.floor(Math.random() * 3)],
            threshold: 0.015,
            currentPrice: Math.random() * 0.01 + 0.005,
            alertType: Math.random() > 0.5 ? "below" : "above"
          } as PriceAlert
        };
        setLastMessage(alertEvent);
        triggerEventListeners("price_alert", alertEvent);

        const alertData = alertEvent.data as PriceAlert;
        showNotification(
          "Price Alert! 💰",
          `${alertData.location}: ${alertData.currentPrice.toFixed(3)}/kWh is ${alertData.alertType} your threshold`,
          "🚨"
        );
      }
    }, 30000);

    // Store intervals for cleanup
    return () => {
      clearInterval(marketDataInterval);
      clearInterval(bidUpdateInterval);
      clearInterval(alertInterval);
    };
  }, [showNotification]);

  const triggerEventListeners = useCallback((eventType: string, event: WebSocketEvent) => {
    const listeners = eventListenersRef.current.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }, []);

  const handleReconnect = useCallback(() => {
    if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`🔄 Reconnecting attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
        connect();
      }, reconnectInterval);
    }
  }, [autoReconnect, maxReconnectAttempts, reconnectInterval, connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionState("disconnected");
  }, []);

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current && connectionState === "connected") {
      wsRef.current.send(JSON.stringify(message));
    }
  }, [connectionState]);

  const addEventListener = useCallback((eventType: string, listener: (event: WebSocketEvent) => void) => {
    if (!eventListenersRef.current.has(eventType)) {
      eventListenersRef.current.set(eventType, new Set());
    }
    eventListenersRef.current.get(eventType)?.add(listener);

    // Return cleanup function
    return () => {
      eventListenersRef.current.get(eventType)?.delete(listener);
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    addEventListener,
    isConnected: connectionState === "connected"
  };
}

// Helper hooks for specific use cases
export function useMarketNotifications() {
  const { addEventListener, isConnected } = useWebSocket();
  const [notifications, setNotifications] = useState<WebSocketEvent[]>([]);

  useEffect(() => {
    const cleanupFunctions = [
      addEventListener("bid_update", (event) => {
        setNotifications(prev => [event, ...prev].slice(0, 50)); // Keep last 50
      }),
      addEventListener("price_alert", (event) => {
        setNotifications(prev => [event, ...prev].slice(0, 50));
      }),
      addEventListener("auction_start", (event) => {
        setNotifications(prev => [event, ...prev].slice(0, 50));
      }),
      addEventListener("auction_end", (event) => {
        setNotifications(prev => [event, ...prev].slice(0, 50));
      })
    ];

    return () => {
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }
    };
  }, [addEventListener]);

  return { notifications, isConnected };
}

export function useLiveBidding(auctionId?: string) {
  const { addEventListener, sendMessage, isConnected } = useWebSocket();
  const [bids, setBids] = useState<BidUpdate[]>([]);
  const [currentHighestBid, setCurrentHighestBid] = useState<BidUpdate | null>(null);

  useEffect(() => {
    const cleanup = addEventListener("bid_update", (event) => {
      const bidData = event.data as BidUpdate;

      if (!auctionId || bidData.auctionId === auctionId) {
        setBids(prev => [bidData, ...prev].slice(0, 20)); // Keep last 20 bids

        // Update highest bid
        setCurrentHighestBid(prev => {
          if (!prev || bidData.price > prev.price) {
            return bidData;
          }
          return prev;
        });
      }
    });

    return cleanup;
  }, [addEventListener, auctionId]);

  const placeBid = useCallback((bid: { amount: number; price: number; bidderType: string }) => {
    if (isConnected) {
      sendMessage({
        type: "place_bid",
        auctionId,
        ...bid,
        timestamp: new Date()
      });
    }
  }, [sendMessage, isConnected, auctionId]);

  return { bids, currentHighestBid, placeBid, isConnected };
}

export function useMarketData() {
  const { addEventListener, isConnected } = useWebSocket();
  const [marketData, setMarketData] = useState<MarketDataUpdate | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const cleanup = addEventListener("market_data", (event) => {
      const data = event.data as MarketDataUpdate;
      setMarketData(data);
      setLastUpdated(event.timestamp);
    });

    return cleanup;
  }, [addEventListener]);

  return { marketData, lastUpdated, isConnected };
}
