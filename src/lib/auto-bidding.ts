// Auto-Bidding Service for Energy Marketplace
// Handles automated bidding strategies and price alerts for consumers

import type { EnergyBlock } from "./energy-data";

export type BiddingStrategy = "conservative" | "aggressive" | "balanced" | "custom";
export type AlertType = "price_drop" | "new_listing" | "auction_ending" | "outbid" | "won_bid";

export interface AutoBidRule {
  id: string;
  name: string;
  enabled: boolean;
  strategy: BiddingStrategy;
  conditions: {
    maxPrice: number; // $/kWh
    minEnergy: number; // MWh
    energyTypes: string[]; // ["Solar", "Wind", etc.]
    locations?: string[]; // Optional location filters
    timeWindow?: number; // Minutes before auction ends
    behindTheFence?: boolean; // Prefer on-site power
  };
  actions: {
    bidIncrement: number; // How much to increase bid by
    maxAttempts: number; // How many times to re-bid if outbid
    autoOutbid: boolean; // Automatically outbid competitors
    bidTiming: "immediate" | "strategic" | "last_minute";
  };
  limits: {
    dailyBudget: number; // $ per day
    maxBidsPerHour: number;
    pauseAfterWin: boolean; // Pause after winning a bid
  };
  createdAt: Date;
  lastTriggered?: Date;
}

export interface PriceAlert {
  id: string;
  name: string;
  enabled: boolean;
  type: AlertType;
  conditions: {
    targetPrice?: number; // $/kWh threshold
    energyTypes: string[];
    locations?: string[];
    priceChange?: number; // Percentage change trigger
    volumeThreshold?: number; // MWh minimum
  };
  notifications: {
    email: boolean;
    browser: boolean;
    webhook?: string;
  };
  triggeredCount: number;
  lastTriggered?: Date;
  createdAt: Date;
}

export interface BidResult {
  success: boolean;
  bidId?: string;
  amount: number;
  price: number;
  energyBlockId: string;
  timestamp: Date;
  error?: string;
}

export interface MarketAnalytics {
  averagePrice: number;
  priceRange: { min: number; max: number };
  volumeAvailable: number;
  trendDirection: "up" | "down" | "stable";
  competitionLevel: "low" | "medium" | "high";
  recommendedBidPrice: number;
}

// Auto-bidding engine
export class AutoBiddingEngine {
  private rules: AutoBidRule[] = [];
  private alerts: PriceAlert[] = [];
  private isActive = false;
  private marketData: Map<string, MarketAnalytics> = new Map();

  constructor() {
    // Load saved rules and alerts from localStorage (client-side only)
    this.loadSettings();

    // Add demo data if no rules exist (client-side only)
    if (typeof window !== "undefined" && this.rules.length === 0) {
      this.initializeDemoData();
    }
  }

  // Rule management
  addBidRule(rule: Omit<AutoBidRule, "id" | "createdAt">): AutoBidRule {
    const newRule: AutoBidRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date()
    };
    this.rules.push(newRule);
    this.saveSettings();
    return newRule;
  }

  updateBidRule(id: string, updates: Partial<AutoBidRule>): boolean {
    const ruleIndex = this.rules.findIndex(r => r.id === id);
    if (ruleIndex === -1) return false;

    this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    this.saveSettings();
    return true;
  }

  deleteBidRule(id: string): boolean {
    const initialLength = this.rules.length;
    this.rules = this.rules.filter(r => r.id !== id);
    this.saveSettings();
    return this.rules.length < initialLength;
  }

  getBidRules(): AutoBidRule[] {
    return [...this.rules];
  }

  // Alert management
  addPriceAlert(alert: Omit<PriceAlert, "id" | "createdAt" | "triggeredCount">): PriceAlert {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: new Date(),
      triggeredCount: 0
    };
    this.alerts.push(newAlert);
    this.saveSettings();
    return newAlert;
  }

  updatePriceAlert(id: string, updates: Partial<PriceAlert>): boolean {
    const alertIndex = this.alerts.findIndex(a => a.id === id);
    if (alertIndex === -1) return false;

    this.alerts[alertIndex] = { ...this.alerts[alertIndex], ...updates };
    this.saveSettings();
    return true;
  }

  deletePriceAlert(id: string): boolean {
    const initialLength = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.saveSettings();
    return this.alerts.length < initialLength;
  }

  getPriceAlerts(): PriceAlert[] {
    return [...this.alerts];
  }

  // Auto-bidding logic
  async evaluateEnergyBlocks(energyBlocks: EnergyBlock[]): Promise<BidResult[]> {
    if (!this.isActive) return [];

    const results: BidResult[] = [];
    const enabledRules = this.rules.filter(r => r.enabled);

    for (const block of energyBlocks) {
      if (block.status !== "available" && block.status !== "bidding") continue;

      for (const rule of enabledRules) {
        if (this.shouldBid(block, rule)) {
          const bidResult = await this.placeBid(block, rule);
          if (bidResult) {
            results.push(bidResult);
            rule.lastTriggered = new Date();
          }
        }
      }
    }

    this.saveSettings();
    return results;
  }

  private shouldBid(block: EnergyBlock, rule: AutoBidRule): boolean {
    const { conditions, limits } = rule;

    // Check price limit
    if (block.price > conditions.maxPrice) return false;

    // Check minimum energy requirement
    if (block.available < conditions.minEnergy) return false;

    // Check energy type filter
    if (conditions.energyTypes.length > 0 && !conditions.energyTypes.includes(block.type)) return false;

    // Check location filter
    if (conditions.locations && conditions.locations.length > 0) {
      if (!conditions.locations.some(loc => block.location.toLowerCase().includes(loc.toLowerCase()))) {
        return false;
      }
    }

    // Check behind-the-fence preference
    if (conditions.behindTheFence !== undefined && conditions.behindTheFence !== block.behindTheFence) {
      return false;
    }

    // Check daily budget (simplified - would need real bid tracking)
    // This would need integration with actual bid history

    // Check rate limiting
    if (rule.lastTriggered) {
      const hoursSinceLastBid = (Date.now() - rule.lastTriggered.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastBid < (1 / limits.maxBidsPerHour)) return false;
    }

    return true;
  }

  private async placeBid(block: EnergyBlock, rule: AutoBidRule): Promise<BidResult | null> {
    try {
      // Calculate bid price based on strategy
      const bidPrice = this.calculateBidPrice(block, rule);

      // Simulate bid placement (in real app, this would call the API)
      const bidResult: BidResult = {
        success: true,
        bidId: `bid_${Date.now()}`,
        amount: Math.min(block.available, rule.conditions.minEnergy),
        price: bidPrice,
        energyBlockId: block.id,
        timestamp: new Date()
      };

      // Trigger success alert if configured
      this.triggerAlert("won_bid", {
        energyBlock: block,
        bidPrice,
        rule
      });

      return bidResult;
    } catch (error) {
      return {
        success: false,
        amount: 0,
        price: 0,
        energyBlockId: block.id,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  private calculateBidPrice(block: EnergyBlock, rule: AutoBidRule): number {
    const { strategy, actions } = rule;
    const currentPrice = block.price;

    switch (strategy) {
      case "conservative":
        return Math.min(currentPrice + (actions.bidIncrement * 0.5), rule.conditions.maxPrice);

      case "aggressive":
        return Math.min(currentPrice + (actions.bidIncrement * 1.5), rule.conditions.maxPrice);

      case "balanced":
        return Math.min(currentPrice + actions.bidIncrement, rule.conditions.maxPrice);

      case "custom":
        // Use market analytics for smarter bidding
        const analytics = this.getMarketAnalytics(block.type);
        if (analytics) {
          return Math.min(analytics.recommendedBidPrice, rule.conditions.maxPrice);
        }
        return Math.min(currentPrice + actions.bidIncrement, rule.conditions.maxPrice);

      default:
        return Math.min(currentPrice + actions.bidIncrement, rule.conditions.maxPrice);
    }
  }

  // Alert system
  checkPriceAlerts(energyBlocks: EnergyBlock[]): void {
    const enabledAlerts = this.alerts.filter(a => a.enabled);

    for (const alert of enabledAlerts) {
      for (const block of energyBlocks) {
        if (this.shouldTriggerAlert(block, alert)) {
          this.triggerAlert(alert.type, { energyBlock: block, alert });
          alert.triggeredCount++;
          alert.lastTriggered = new Date();
        }
      }
    }

    this.saveSettings();
  }

  private shouldTriggerAlert(block: EnergyBlock, alert: PriceAlert): boolean {
    const { conditions } = alert;

    // Check energy type filter
    if (!conditions.energyTypes.includes(block.type)) return false;

    // Check location filter
    if (conditions.locations && conditions.locations.length > 0) {
      if (!conditions.locations.some(loc => block.location.toLowerCase().includes(loc.toLowerCase()))) {
        return false;
      }
    }

    // Check price threshold
    if (conditions.targetPrice !== undefined) {
      if (alert.type === "price_drop" && block.price >= conditions.targetPrice) return false;
      if (alert.type === "new_listing" && block.price > conditions.targetPrice) return false;
    }

    // Check volume threshold
    if (conditions.volumeThreshold && block.available < conditions.volumeThreshold) return false;

    return true;
  }

  private triggerAlert(type: AlertType, data: any): void {
    // Browser notification
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`EnergyBid Alert: ${type.replace("_", " ").toUpperCase()}`, {
          body: this.formatAlertMessage(type, data),
          icon: "/favicon.ico"
        });
      }
    }

    // Console log for development
    console.log(`🔔 Alert triggered: ${type}`, data);
  }

  private formatAlertMessage(type: AlertType, data: any): string {
    const { energyBlock } = data;

    switch (type) {
      case "price_drop":
        return `Price dropped to $${energyBlock.price}/kWh for ${energyBlock.type} energy at ${energyBlock.location}`;
      case "new_listing":
        return `New ${energyBlock.type} energy listing available at ${energyBlock.location} - $${energyBlock.price}/kWh`;
      case "auction_ending":
        return `Auction ending soon for ${energyBlock.location} - ${energyBlock.timeRemaining} remaining`;
      case "won_bid":
        return `Congratulations! You won the bid for ${energyBlock.location} at $${data.bidPrice}/kWh`;
      case "outbid":
        return `You've been outbid on ${energyBlock.location}. Current price: $${energyBlock.price}/kWh`;
      default:
        return `Energy market alert for ${energyBlock.location}`;
    }
  }

  // Market analytics
  updateMarketAnalytics(energyBlocks: EnergyBlock[]): void {
    const typeGroups = energyBlocks.reduce((acc, block) => {
      if (!acc[block.type]) acc[block.type] = [];
      acc[block.type].push(block);
      return acc;
    }, {} as Record<string, EnergyBlock[]>);

    for (const [type, blocks] of Object.entries(typeGroups)) {
      const prices = blocks.map(b => b.price);
      const volumes = blocks.map(b => b.available);

      const analytics: MarketAnalytics = {
        averagePrice: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices)
        },
        volumeAvailable: volumes.reduce((sum, v) => sum + v, 0),
        trendDirection: this.calculateTrend(type, prices),
        competitionLevel: blocks.filter(b => b.status === "bidding").length > blocks.length * 0.7 ? "high" :
                         blocks.filter(b => b.status === "bidding").length > blocks.length * 0.3 ? "medium" : "low",
        recommendedBidPrice: this.calculateRecommendedPrice(prices)
      };

      this.marketData.set(type, analytics);
    }
  }

  private calculateTrend(energyType: string, currentPrices: number[]): "up" | "down" | "stable" {
    // Simplified trend calculation (would use historical data in real implementation)
    const avgPrice = currentPrices.reduce((sum, p) => sum + p, 0) / currentPrices.length;
    const variance = currentPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / currentPrices.length;

    if (variance < 0.001) return "stable";
    return avgPrice > 0.03 ? "up" : "down"; // Simplified
  }

  private calculateRecommendedPrice(prices: number[]): number {
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const competitiveBid = avgPrice * 1.05; // 5% above average
    return Math.round(competitiveBid * 1000) / 1000; // Round to 3 decimal places
  }

  getMarketAnalytics(energyType: string): MarketAnalytics | undefined {
    return this.marketData.get(energyType);
  }

  // Engine control
  start(): void {
    this.isActive = true;
    console.log("🤖 Auto-bidding engine started");
  }

  stop(): void {
    this.isActive = false;
    console.log("⏸️ Auto-bidding engine stopped");
  }

  isRunning(): boolean {
    return this.isActive;
  }

  // Persistence
  private saveSettings(): void {
    // Only save settings on client side
    if (typeof window === "undefined") return;

    localStorage.setItem("energybid_rules", JSON.stringify(this.rules));
    localStorage.setItem("energybid_alerts", JSON.stringify(this.alerts));
  }

  private loadSettings(): void {
    // Only load settings on client side
    if (typeof window === "undefined") return;

    try {
      const rulesData = localStorage.getItem("energybid_rules");
      if (rulesData) {
        this.rules = JSON.parse(rulesData).map((rule: any) => ({
          ...rule,
          createdAt: new Date(rule.createdAt),
          lastTriggered: rule.lastTriggered ? new Date(rule.lastTriggered) : undefined
        }));
      }

      const alertsData = localStorage.getItem("energybid_alerts");
      if (alertsData) {
        this.alerts = JSON.parse(alertsData).map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : undefined
        }));
      }
    } catch (error) {
      console.error("Failed to load auto-bidding settings:", error);
    }
  }

  // Get summary statistics
  getStats() {
    return {
      activeRules: this.rules.filter(r => r.enabled).length,
      totalRules: this.rules.length,
      activeAlerts: this.alerts.filter(a => a.enabled).length,
      totalAlerts: this.alerts.length,
      isEngineRunning: this.isActive,
      marketDataTypes: Array.from(this.marketData.keys())
    };
  }

  // Initialize demo data for new users
  private initializeDemoData(): void {
    // Demo bidding rules
    const demoRules: Omit<AutoBidRule, "id" | "createdAt">[] = [
      {
        name: "Solar Energy Hunter",
        enabled: true,
        strategy: "balanced",
        conditions: {
          maxPrice: 0.030,
          minEnergy: 10,
          energyTypes: ["Solar"],
          behindTheFence: false
        },
        actions: {
          bidIncrement: 0.002,
          maxAttempts: 3,
          autoOutbid: true,
          bidTiming: "strategic"
        },
        limits: {
          dailyBudget: 500,
          maxBidsPerHour: 5,
          pauseAfterWin: false
        }
      },
      {
        name: "Cheap Wind Power",
        enabled: false,
        strategy: "conservative",
        conditions: {
          maxPrice: 0.025,
          minEnergy: 15,
          energyTypes: ["Wind"],
          timeWindow: 30
        },
        actions: {
          bidIncrement: 0.001,
          maxAttempts: 2,
          autoOutbid: false,
          bidTiming: "last_minute"
        },
        limits: {
          dailyBudget: 300,
          maxBidsPerHour: 3,
          pauseAfterWin: true
        }
      },
      {
        name: "Behind-the-Fence Industrial",
        enabled: true,
        strategy: "aggressive",
        conditions: {
          maxPrice: 0.045,
          minEnergy: 5,
          energyTypes: ["Cogeneration", "Industrial Steam"],
          behindTheFence: true
        },
        actions: {
          bidIncrement: 0.003,
          maxAttempts: 5,
          autoOutbid: true,
          bidTiming: "immediate"
        },
        limits: {
          dailyBudget: 1000,
          maxBidsPerHour: 8,
          pauseAfterWin: false
        }
      }
    ];

    // Demo price alerts
    const demoAlerts: Omit<PriceAlert, "id" | "createdAt" | "triggeredCount">[] = [
      {
        name: "Solar Price Drop Alert",
        enabled: true,
        type: "price_drop",
        conditions: {
          targetPrice: 0.020,
          energyTypes: ["Solar"]
        },
        notifications: {
          email: true,
          browser: true
        }
      },
      {
        name: "New Wind Listing Alert",
        enabled: true,
        type: "new_listing",
        conditions: {
          targetPrice: 0.030,
          energyTypes: ["Wind"],
          volumeThreshold: 20
        },
        notifications: {
          email: false,
          browser: true
        }
      },
      {
        name: "Auction Ending Soon",
        enabled: false,
        type: "auction_ending",
        conditions: {
          energyTypes: ["Solar", "Wind", "Hydro"]
        },
        notifications: {
          email: true,
          browser: true
        }
      }
    ];

    // Add demo data
    demoRules.forEach(rule => this.addBidRule(rule));
    demoAlerts.forEach(alert => this.addPriceAlert(alert));

    console.log("🤖 Initialized demo auto-bidding data");
  }
}

// Export singleton instance
export const autoBiddingEngine = new AutoBiddingEngine();
