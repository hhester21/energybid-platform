// AI Forecasting Engine for Energy Market Predictions
// Implements machine learning models for price forecasting and market analysis

import type { EnergyBlock, GridData } from "./energy-data";

export interface PricePrediction {
  timestamp: Date;
  energyType: string;
  predictedPrice: number; // $/kWh
  confidence: number; // 0-100%
  priceRange: { min: number; max: number };
  factors: string[]; // Influencing factors
}

export interface SurplusForecast {
  energyType: string;
  expectedSurplus: number; // MWh
  probability: number; // 0-100%
  peakTimes: string[];
  curtailmentRisk: number; // 0-100%
  timestamp: Date;
}

export interface MarketOpportunity {
  id: string;
  energyType: string;
  location: string;
  opportunityType: "price_drop" | "high_availability" | "low_competition" | "arbitrage";
  description: string;
  potentialSavings: number; // $
  confidence: number; // 0-100%
  timeToAct: number; // minutes
  severity: "low" | "medium" | "high";
  recommendedAction: string;
}

export interface AIMarketInsights {
  marketTrend: "bullish" | "bearish" | "neutral";
  volatility: "low" | "medium" | "high";
  liquidityScore: number; // 0-100%
  competitionLevel: number; // 0-100%
  riskLevel: number; // 0-100%
  recommendedStrategy: "conservative" | "balanced" | "aggressive";
  keyFactors: string[];
  generatedAt: Date;
}

export interface ForecastingModel {
  name: string;
  type: "price" | "surplus" | "demand" | "opportunity";
  accuracy: number; // 0-100%
  lastTrained: Date;
  predictions: number; // total predictions made
  features: string[]; // input features
}

// Machine Learning Engine
class MLEngine {
  private models: Map<string, ForecastingModel> = new Map();
  private historicalData: Map<string, number[]> = new Map();

  constructor() {
    this.initializeModels();
  }

  // Price prediction using simplified ML
  predictPrice(energyType: string, timeHorizon: "1h" | "4h" | "24h" | "7d"): PricePrediction[] {
    const model = this.models.get(`price_${energyType.toLowerCase()}`);
    if (!model) {
      throw new Error(`No model found for ${energyType} price prediction`);
    }

    const predictions: PricePrediction[] = [];
    const basePrice = this.getBasePrice(energyType);
    const hoursAhead = this.getHoursFromHorizon(timeHorizon);

    for (let i = 0; i < hoursAhead; i++) {
      const timestamp = new Date(Date.now() + i * 60 * 60 * 1000);
      const hour = timestamp.getHours();

      // Simulate price prediction with patterns
      const demandMultiplier = this.getDemandMultiplier(hour, energyType);
      const seasonalFactor = this.getSeasonalFactor(timestamp, energyType);
      const volatilityFactor = 1 + (Math.random() - 0.5) * 0.2; // ±10% volatility

      const predictedPrice = basePrice * demandMultiplier * seasonalFactor * volatilityFactor;
      const confidence = Math.max(60, model.accuracy - (i * 2)); // Confidence decreases over time

      predictions.push({
        timestamp,
        energyType,
        predictedPrice: Math.max(0.001, predictedPrice),
        confidence: Math.min(100, confidence),
        priceRange: {
          min: predictedPrice * 0.9,
          max: predictedPrice * 1.1
        },
        factors: this.getInfluencingFactors(energyType, hour)
      });
    }

    return predictions;
  }

  // Surplus energy forecasting
  forecastSurplus(energyType: string, timeHorizon: "1h" | "4h" | "24h" | "7d"): SurplusForecast {
    const hoursAhead = this.getHoursFromHorizon(timeHorizon);
    const now = new Date();

    // Base surplus amounts by energy type
    const baseSurplus = {
      "Solar": 150,
      "Wind": 200,
      "Hydro": 80,
      "Natural Gas": 50,
      "Cogeneration": 30,
      "Industrial Steam": 25,
      "LNG": 40
    };

    const expectedSurplus = baseSurplus[energyType as keyof typeof baseSurplus] || 50;

    // Adjust for time of day and weather patterns
    const timeMultiplier = energyType === "Solar"
      ? Math.max(0.1, Math.sin((now.getHours() - 6) * Math.PI / 12))
      : energyType === "Wind"
      ? 0.8 + Math.random() * 0.4
      : 0.9 + Math.random() * 0.2;

    const finalSurplus = expectedSurplus * timeMultiplier;

    // Calculate peak times
    const peakTimes = this.calculatePeakTimes(energyType);

    // Curtailment risk based on surplus amount
    const curtailmentRisk = Math.min(100, Math.max(0, (finalSurplus - 100) * 2));

    return {
      energyType,
      expectedSurplus: Math.round(finalSurplus * 10) / 10,
      probability: Math.max(70, 95 - hoursAhead * 2),
      peakTimes,
      curtailmentRisk,
      timestamp: now
    };
  }

  // Market opportunity analysis
  analyzeOpportunities(energyBlocks: EnergyBlock[]): MarketOpportunity[] {
    const opportunities: MarketOpportunity[] = [];

    // Price drop opportunities
    energyBlocks
      .filter(block => block.price < 0.020) // Very low prices
      .forEach(block => {
        opportunities.push({
          id: `price_drop_${block.id}`,
          energyType: block.type,
          location: block.location,
          opportunityType: "price_drop",
          description: `Extremely low price detected for ${block.type} energy`,
          potentialSavings: (0.035 - block.price) * block.available * 1000,
          confidence: 92,
          timeToAct: Math.floor(Math.random() * 30) + 5,
          severity: block.price < 0 ? "high" : "medium",
          recommendedAction: "Place Bid Immediately"
        });
      });

    // High availability opportunities
    energyBlocks
      .filter(block => block.available > 30)
      .forEach(block => {
        opportunities.push({
          id: `high_avail_${block.id}`,
          energyType: block.type,
          location: block.location,
          opportunityType: "high_availability",
          description: `Large volume of ${block.type} energy available`,
          potentialSavings: block.available * 15, // $15 per MWh savings
          confidence: 78,
          timeToAct: Math.floor(Math.random() * 60) + 15,
          severity: "medium",
          recommendedAction: "Consider Bulk Purchase"
        });
      });

    // Low competition opportunities
    energyBlocks
      .filter(block => block.status === "available") // Not in bidding
      .slice(0, 3)
      .forEach(block => {
        opportunities.push({
          id: `low_comp_${block.id}`,
          energyType: block.type,
          location: block.location,
          opportunityType: "low_competition",
          description: `No current bidding competition for ${block.type}`,
          potentialSavings: block.price * block.available * 200, // Avoid bidding wars
          confidence: 85,
          timeToAct: Math.floor(Math.random() * 45) + 10,
          severity: "low",
          recommendedAction: "Place Strategic Bid"
        });
      });

    return opportunities.slice(0, 8); // Limit to top opportunities
  }

  // Generate comprehensive market insights
  generateMarketInsights(energyBlocks: EnergyBlock[], gridData: GridData): AIMarketInsights {
    const prices = energyBlocks.map(b => b.price);
    const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const priceVolatility = this.calculateVolatility(prices);

    // Market trend analysis
    const recentPrices = prices.slice(-10); // Last 10 prices
    const trend = recentPrices[recentPrices.length - 1] > recentPrices[0] ? "bullish" : "bearish";

    // Competition analysis
    const biddingBlocks = energyBlocks.filter(b => b.status === "bidding").length;
    const competitionLevel = Math.min(100, (biddingBlocks / energyBlocks.length) * 150);

    // Liquidity analysis
    const totalVolume = energyBlocks.reduce((sum, b) => sum + b.available, 0);
    const liquidityScore = Math.min(100, totalVolume / 10); // Simplified liquidity scoring

    // Risk assessment
    const riskLevel = Math.min(100, priceVolatility * 100 + (gridData.curtailment / 20));

    return {
      marketTrend: Math.abs(recentPrices[recentPrices.length - 1] - recentPrices[0]) < 0.005 ? "neutral" : trend,
      volatility: priceVolatility > 0.3 ? "high" : priceVolatility > 0.15 ? "medium" : "low",
      liquidityScore: Math.round(liquidityScore),
      competitionLevel: Math.round(competitionLevel),
      riskLevel: Math.round(riskLevel),
      recommendedStrategy: riskLevel > 70 ? "conservative" : riskLevel > 40 ? "balanced" : "aggressive",
      keyFactors: this.generateKeyFactors(energyBlocks, gridData, avgPrice),
      generatedAt: new Date()
    };
  }

  // Model training simulation
  async trainModels(energyBlocks: EnergyBlock[]): Promise<void> {
    const energyTypes = [...new Set(energyBlocks.map(b => b.type))];

    for (const type of energyTypes) {
      const modelKey = `price_${type.toLowerCase()}`;
      const model = this.models.get(modelKey);

      if (model) {
        // Simulate training process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update model accuracy (simulate improvement)
        model.accuracy = Math.min(98, model.accuracy + Math.random() * 2);
        model.lastTrained = new Date();
        model.predictions += Math.floor(Math.random() * 100) + 50;

        console.log(`🤖 Trained ${type} price prediction model - Accuracy: ${model.accuracy.toFixed(1)}%`);
      }
    }
  }

  // Get model statistics
  getModelStats(): ForecastingModel[] {
    return Array.from(this.models.values());
  }

  // Helper methods
  private initializeModels(): void {
    const energyTypes = ["Solar", "Wind", "Hydro", "Natural Gas", "Cogeneration"];
    const modelTypes = ["price", "surplus", "demand"];

    for (const energyType of energyTypes) {
      for (const modelType of modelTypes) {
        const key = `${modelType}_${energyType.toLowerCase()}`;
        this.models.set(key, {
          name: `${energyType} ${modelType.charAt(0).toUpperCase() + modelType.slice(1)} Predictor`,
          type: modelType as any,
          accuracy: 75 + Math.random() * 20, // 75-95% accuracy
          lastTrained: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random last week
          predictions: Math.floor(Math.random() * 10000) + 1000,
          features: this.getModelFeatures(energyType, modelType)
        });
      }
    }
  }

  private getModelFeatures(energyType: string, modelType: string): string[] {
    const commonFeatures = ["hour_of_day", "day_of_week", "month", "grid_demand"];

    const typeSpecific = {
      "Solar": ["solar_irradiance", "cloud_cover", "temperature"],
      "Wind": ["wind_speed", "wind_direction", "barometric_pressure"],
      "Hydro": ["water_level", "precipitation", "seasonal_flow"],
      "Natural Gas": ["gas_prices", "pipeline_capacity", "storage_levels"],
      "Cogeneration": ["industrial_demand", "heat_demand", "fuel_costs"]
    };

    const modelSpecific = {
      "price": ["market_volatility", "competition_level", "bid_history"],
      "surplus": ["generation_capacity", "curtailment_history", "grid_constraints"],
      "demand": ["load_forecast", "economic_indicators", "weather_forecast"]
    };

    return [
      ...commonFeatures,
      ...(typeSpecific[energyType as keyof typeof typeSpecific] || []),
      ...(modelSpecific[modelType as keyof typeof modelSpecific] || [])
    ];
  }

  private getBasePrice(energyType: string): number {
    const basePrices = {
      "Solar": 0.025,
      "Wind": 0.022,
      "Hydro": 0.020,
      "Natural Gas": 0.035,
      "Cogeneration": 0.040,
      "Industrial Steam": 0.045,
      "LNG": 0.038
    };
    return basePrices[energyType as keyof typeof basePrices] || 0.030;
  }

  private getHoursFromHorizon(horizon: string): number {
    switch (horizon) {
      case "1h": return 1;
      case "4h": return 4;
      case "24h": return 24;
      case "7d": return 168;
      default: return 24;
    }
  }

  private getDemandMultiplier(hour: number, energyType: string): number {
    // Peak demand hours (morning and evening)
    if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 21)) {
      return energyType === "Solar" && hour >= 17 ? 0.7 : 1.3; // Solar drops in evening
    }

    // Midday solar peak
    if (hour >= 11 && hour <= 15 && energyType === "Solar") {
      return 0.8; // Lower prices due to oversupply
    }

    return 1.0;
  }

  private getSeasonalFactor(date: Date, energyType: string): number {
    const month = date.getMonth();

    // Summer months (higher demand)
    if (month >= 5 && month <= 8) {
      return energyType === "Solar" ? 1.2 : 1.1;
    }

    // Winter months
    if (month <= 1 || month >= 11) {
      return energyType === "Wind" ? 1.15 : 0.95;
    }

    return 1.0;
  }

  private getInfluencingFactors(energyType: string, hour: number): string[] {
    const factors = ["Market demand", "Grid conditions"];

    if (energyType === "Solar") {
      factors.push(hour >= 6 && hour <= 18 ? "Daylight hours" : "No solar generation");
      factors.push("Weather conditions");
    }

    if (energyType === "Wind") {
      factors.push("Wind patterns", "Seasonal variations");
    }

    if (hour >= 17 && hour <= 21) {
      factors.push("Peak demand period");
    }

    return factors;
  }

  private calculatePeakTimes(energyType: string): string[] {
    switch (energyType) {
      case "Solar":
        return ["10:00 AM", "12:00 PM", "2:00 PM"];
      case "Wind":
        return ["2:00 AM", "6:00 AM", "8:00 PM"];
      case "Hydro":
        return ["6:00 AM", "12:00 PM", "6:00 PM"];
      default:
        return ["9:00 AM", "3:00 PM", "9:00 PM"];
    }
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    return Math.sqrt(variance) / mean;
  }

  private generateKeyFactors(energyBlocks: EnergyBlock[], gridData: GridData, avgPrice: number): string[] {
    const factors = [];

    if (gridData.renewablePercentage > 50) {
      factors.push("High renewable energy supply");
    }

    if (gridData.curtailment > 500) {
      factors.push("Significant curtailment events");
    }

    if (avgPrice < 0.025) {
      factors.push("Below-average market prices");
    }

    const behindFenceCount = energyBlocks.filter(b => b.behindTheFence).length;
    if (behindFenceCount > 3) {
      factors.push("Multiple behind-the-fence opportunities");
    }

    const biddingPercent = energyBlocks.filter(b => b.status === "bidding").length / energyBlocks.length;
    if (biddingPercent > 0.6) {
      factors.push("High market competition");
    }

    return factors.slice(0, 5);
  }
}

// Export singleton instance
export const aiForecastingEngine = new MLEngine();
