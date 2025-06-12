import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./use-websocket";
import type { EnergyBlock } from "./energy-data";

export interface WatchedBlock {
  id: string;
  energyBlock: EnergyBlock;
  watchedAt: Date;
  priceAlerts: {
    enabled: boolean;
    threshold: number;
    type: "above" | "below";
  };
  notifications: {
    priceChanges: boolean;
    statusChanges: boolean;
    bidUpdates: boolean;
  };
}

export function useWatchlist() {
  const [watchedBlocks, setWatchedBlocks] = useState<WatchedBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const { addEventListener, isConnected } = useWebSocket();

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("energybid-watchlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const watchlist = parsed.map((item: any) => ({
          ...item,
          watchedAt: new Date(item.watchedAt),
          energyBlock: {
            ...item.energyBlock,
            // Ensure coordinates are properly structured
            coordinates: item.energyBlock.coordinates
          }
        }));
        setWatchedBlocks(watchlist);
      } catch (error) {
        console.error("Failed to load watchlist:", error);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("energybid-watchlist", JSON.stringify(watchedBlocks));
  }, [watchedBlocks]);

  // Listen for WebSocket updates on watched blocks
  useEffect(() => {
    const cleanupFunctions = [
      addEventListener("bid_update", (event) => {
        const bidData = event.data as any;
        const watchedBlock = watchedBlocks.find(w =>
          w.energyBlock.id === bidData.auctionId ||
          w.energyBlock.location === bidData.location
        );

        if (watchedBlock && watchedBlock.notifications.bidUpdates) {
          // Show notification for bid update on watched block
          if (typeof window !== "undefined" && Notification.permission === "granted") {
            new Notification(`Watched Energy Block Update! 👀`, {
              body: `New bid on ${watchedBlock.energyBlock.location}: $${bidData.price.toFixed(3)}/kWh`,
              icon: "⚡"
            });
          }
        }
      }),

      addEventListener("price_alert", (event) => {
        const alertData = event.data as any;
        const watchedBlock = watchedBlocks.find(w =>
          w.energyBlock.id === alertData.energyBlockId ||
          w.energyBlock.location === alertData.location
        );

        if (watchedBlock && watchedBlock.notifications.priceChanges) {
          // Show notification for price change on watched block
          if (typeof window !== "undefined" && Notification.permission === "granted") {
            new Notification(`Watched Block Price Alert! 💰`, {
              body: `${alertData.location}: $${alertData.currentPrice.toFixed(3)}/kWh (${alertData.alertType} threshold)`,
              icon: "🚨"
            });
          }
        }
      }),

      addEventListener("market_data", (event) => {
        const marketData = event.data as any;
        if (marketData.energyBlocks && Array.isArray(marketData.energyBlocks)) {
          // Update watched blocks with new market data
          setWatchedBlocks(prev => prev.map(watched => {
            const updatedBlock = marketData.energyBlocks.find((block: EnergyBlock) =>
              block.id === watched.energyBlock.id
            );

            if (updatedBlock) {
              // Check price alerts
              if (watched.priceAlerts.enabled) {
                const currentPrice = updatedBlock.price;
                const threshold = watched.priceAlerts.threshold;
                const alertType = watched.priceAlerts.type;

                const shouldAlert = (alertType === "above" && currentPrice > threshold) ||
                                 (alertType === "below" && currentPrice < threshold);

                if (shouldAlert) {
                  if (typeof window !== "undefined" && Notification.permission === "granted") {
                    new Notification(`Watchlist Price Alert! 🎯`, {
                      body: `${updatedBlock.location}: $${currentPrice.toFixed(3)}/kWh is ${alertType} your threshold of $${threshold.toFixed(3)}/kWh`,
                      icon: "⚡"
                    });
                  }
                }
              }

              return {
                ...watched,
                energyBlock: updatedBlock
              };
            }
            return watched;
          }));
        }
      })
    ];

    return () => {
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }
    };
  }, [addEventListener, watchedBlocks]);

  const addToWatchlist = useCallback((energyBlock: EnergyBlock) => {
    setLoading(true);

    const newWatchedBlock: WatchedBlock = {
      id: `watch_${energyBlock.id}_${Date.now()}`,
      energyBlock,
      watchedAt: new Date(),
      priceAlerts: {
        enabled: false,
        threshold: energyBlock.price,
        type: "below"
      },
      notifications: {
        priceChanges: true,
        statusChanges: true,
        bidUpdates: true
      }
    };

    setWatchedBlocks(prev => {
      // Check if already watching this block
      const exists = prev.some(w => w.energyBlock.id === energyBlock.id);
      if (exists) {
        return prev;
      }
      return [newWatchedBlock, ...prev];
    });

    // Show confirmation notification
    if (typeof window !== "undefined" && Notification.permission === "granted") {
      new Notification("Added to Watchlist! 👀", {
        body: `Now watching ${energyBlock.location} for updates`,
        icon: "⚡"
      });
    }

    setLoading(false);
  }, []);

  const removeFromWatchlist = useCallback((blockId: string) => {
    setWatchedBlocks(prev => prev.filter(w => w.energyBlock.id !== blockId));

    if (typeof window !== "undefined" && Notification.permission === "granted") {
      new Notification("Removed from Watchlist", {
        body: "Energy block removed from your watchlist",
        icon: "⚡"
      });
    }
  }, []);

  const updateWatchSettings = useCallback((watchId: string, updates: Partial<Omit<WatchedBlock, 'id' | 'energyBlock' | 'watchedAt'>>) => {
    setWatchedBlocks(prev => prev.map(w =>
      w.id === watchId ? { ...w, ...updates } : w
    ));
  }, []);

  const isWatching = useCallback((blockId: string) => {
    return watchedBlocks.some(w => w.energyBlock.id === blockId);
  }, [watchedBlocks]);

  const getWatchedBlock = useCallback((blockId: string) => {
    return watchedBlocks.find(w => w.energyBlock.id === blockId);
  }, [watchedBlocks]);

  const clearWatchlist = useCallback(() => {
    setWatchedBlocks([]);
    localStorage.removeItem("energybid-watchlist");
  }, []);

  return {
    watchedBlocks,
    loading,
    isConnected,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchSettings,
    isWatching,
    getWatchedBlock,
    clearWatchlist,
    watchlistCount: watchedBlocks.length
  };
}
