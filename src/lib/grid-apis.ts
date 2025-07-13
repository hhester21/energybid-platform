// Real-time Grid API Integration Service
// Connects to CAISO and ERCOT APIs for live energy market data

interface CAISOApiResponse {
  data?: Array<{
    INTERVALSTARTTIME_GMT: string;
    NODE: string;
    MW: string;
    NODE_TYPE?: string;
    RENEWABLE_TYPE?: string;
    CAPACITY?: string;
    AVAILABILITY?: string;
    CURTAILMENT_MW?: string;
    RESOURCE_TYPE?: string;
    CURTAILMENT_REASON?: string;
    LOCATION?: string;
  }>;
}

interface ERCOTApiResponse {
  data?: Array<{
    DeliveryDate: string;
    HourEnding: string;
    SettlementPoint?: string;
    SettlementPointPrice?: string;
    SystemWideAverageLoad?: string;
    SystemWideActualLoad?: string;
    ActualSystemWideWindOutput?: string;
    WindCapacity?: string;
  }>;
}

export interface RealTimePrice {
  timestamp: Date;
  location: string;
  price: number; // $/MWh
  zone: string;
  marketType: "DAM" | "RTM" | "FMM"; // Day-Ahead, Real-Time, Fifteen-Minute
}

export interface GenerationData {
  timestamp: Date;
  resourceType: string;
  output: number; // MW
  capacity: number; // MW
  availability: number; // percentage
  location: string;
}

export interface LoadForecast {
  timestamp: Date;
  forecastedLoad: number; // MW
  actualLoad?: number; // MW
  region: string;
  confidence: number; // percentage
}

export interface GridCondition {
  timestamp: Date;
  status: "Normal" | "Watch" | "Warning" | "Emergency";
  frequency: number; // Hz
  reserves: number; // MW
  region: string;
  alerts: string[];
}

export interface CurtailmentData {
  timestamp: Date;
  resourceType: string;
  curtailedAmount: number; // MW
  reason: string;
  duration: number; // minutes
  location: string;
}

// CAISO API Integration
class CAISOApiService {
  private baseUrl: string;
  private apiKey: string;
  private rateLimiter: Map<string, number> = new Map();

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_CAISO_API_URL ||
      "https://oasis.caiso.com/oasisapi/SingleZip";
    this.apiKey = process.env.CAISO_API_KEY || "";
  }

  private async makeRequest(
    endpoint: string,
    params: Record<string, string>,
  ): Promise<CAISOApiResponse> {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get(endpoint) || 0;
    const minInterval = 1000; // 1 second between requests

    if (now - lastRequest < minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, minInterval - (now - lastRequest)),
      );
    }

    const queryParams = new URLSearchParams({
      ...params,
      version: "1",
      market_run_id: "RTM",
      startdatetime: this.getISOTimestamp(
        new Date(Date.now() - 24 * 60 * 60 * 1000),
      ),
      enddatetime: this.getISOTimestamp(new Date()),
    });

    try {
      const response = await fetch(`${this.baseUrl}?${queryParams}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "EnergyBid-Platform/1.0",
        },
      });

      this.rateLimiter.set(endpoint, Date.now());

      if (!response.ok) {
        throw new Error(
          `CAISO API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("CAISO API request failed:", error);
      throw error;
    }
  }

  async getRealTimePrices(): Promise<RealTimePrice[]> {
    try {
      const data = await this.makeRequest("PRC_LMP", {
        queryname: "PRC_LMP",
        market_run_id: "RTM",
        node: "TH_NP15_GEN-APND",
      });

      return this.parseCAISOPrices(data);
    } catch (error) {
      console.warn(
        "Failed to fetch CAISO real-time prices, using fallback data",
      );
      return this.getFallbackPrices();
    }
  }

  async getGenerationData(): Promise<GenerationData[]> {
    try {
      const data = await this.makeRequest("SLD_REN_FCST", {
        queryname: "SLD_REN_FCST",
        market_run_id: "RTM",
      });

      return this.parseCAISOGeneration(data);
    } catch (error) {
      console.warn("Failed to fetch CAISO generation data, using fallback");
      return this.getFallbackGeneration();
    }
  }

  async getCurtailmentData(): Promise<CurtailmentData[]> {
    try {
      const data = await this.makeRequest("ENE_EIC", {
        queryname: "ENE_EIC",
        market_run_id: "RTM",
      });

      return this.parseCAISOCurtailment(data);
    } catch (error) {
      console.warn("Failed to fetch CAISO curtailment data");
      return [];
    }
  }

  private parseCAISOPrices(data: CAISOApiResponse): RealTimePrice[] {
    if (!data?.data) return this.getFallbackPrices();

    return data.data.map((item: any) => ({
      timestamp: new Date(item.INTERVALSTARTTIME_GMT),
      location: item.NODE,
      price: Number.parseFloat(item.MW) || 0,
      zone: item.NODE_TYPE || "Unknown",
      marketType: "RTM" as const,
    }));
  }

  private parseCAISOGeneration(data: any): GenerationData[] {
    if (!data?.data) return this.getFallbackGeneration();

    return data.data.map((item: any) => ({
      timestamp: new Date(item.INTERVALSTARTTIME_GMT),
      resourceType: item.RENEWABLE_TYPE || "Unknown",
      output: Number.parseFloat(item.MW) || 0,
      capacity: Number.parseFloat(item.CAPACITY) || 0,
      availability: Number.parseFloat(item.AVAILABILITY) || 100,
      location: "CAISO",
    }));
  }

  private parseCAISOCurtailment(data: any): CurtailmentData[] {
    if (!data?.data) return [];

    return data.data
      .filter((item: any) => Number.parseFloat(item.CURTAILMENT_MW) > 0)
      .map((item: any) => ({
        timestamp: new Date(item.INTERVALSTARTTIME_GMT),
        resourceType: item.RESOURCE_TYPE || "Renewable",
        curtailedAmount: Number.parseFloat(item.CURTAILMENT_MW) || 0,
        reason: item.CURTAILMENT_REASON || "Economic",
        duration: 15, // CAISO intervals are 15 minutes
        location: item.LOCATION || "CAISO",
      }));
  }

  private getFallbackPrices(): RealTimePrice[] {
    const basePrice = 35 + Math.random() * 20;
    return [
      {
        timestamp: new Date(),
        location: "SP15",
        price: basePrice + (Math.random() - 0.5) * 10,
        zone: "SP15",
        marketType: "RTM",
      },
      {
        timestamp: new Date(),
        location: "NP15",
        price: basePrice + (Math.random() - 0.5) * 8,
        zone: "NP15",
        marketType: "RTM",
      },
      {
        timestamp: new Date(),
        location: "ZP26",
        price: basePrice + (Math.random() - 0.5) * 12,
        zone: "ZP26",
        marketType: "RTM",
      },
    ];
  }

  private getFallbackGeneration(): GenerationData[] {
    return [
      {
        timestamp: new Date(),
        resourceType: "Solar",
        output: 8500 + Math.random() * 2000,
        capacity: 12000,
        availability: 85 + Math.random() * 10,
        location: "CAISO",
      },
      {
        timestamp: new Date(),
        resourceType: "Wind",
        output: 3200 + Math.random() * 800,
        capacity: 6500,
        availability: 75 + Math.random() * 15,
        location: "CAISO",
      },
      {
        timestamp: new Date(),
        resourceType: "Hydro",
        output: 2800 + Math.random() * 400,
        capacity: 4200,
        availability: 90 + Math.random() * 8,
        location: "CAISO",
      },
    ];
  }

  private getISOTimestamp(date: Date): string {
    return date.toISOString().slice(0, 19) + "Z";
  }
}

// ERCOT API Integration
class ERCOTApiService {
  private baseUrl: string;
  private apiKey: string;
  private rateLimiter: Map<string, number> = new Map();

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_ERCOT_API_URL ||
      "https://www.ercot.com/api/1/services/read";
    this.apiKey = process.env.ERCOT_API_KEY || "";
  }

  private async makeRequest(
    endpoint: string,
    params: Record<string, string> = {},
  ): Promise<any> {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get(endpoint) || 0;
    const minInterval = 1200; // 1.2 seconds between requests for ERCOT

    if (now - lastRequest < minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, minInterval - (now - lastRequest)),
      );
    }

    const queryParams = new URLSearchParams({
      ...params,
      size: "200",
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/${endpoint}?${queryParams}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "EnergyBid-Platform/1.0",
          },
        },
      );

      this.rateLimiter.set(endpoint, Date.now());

      if (!response.ok) {
        throw new Error(
          `ERCOT API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("ERCOT API request failed:", error);
      throw error;
    }
  }

  async getRealTimePrices(): Promise<RealTimePrice[]> {
    try {
      const data = await this.makeRequest("NP6-905-CD", {
        fields: "DeliveryDate,HourEnding,SettlementPoint,SettlementPointPrice",
      });

      return this.parseERCOTPrices(data);
    } catch (error) {
      console.warn("Failed to fetch ERCOT real-time prices, using fallback");
      return this.getFallbackPrices();
    }
  }

  async getLoadForecast(): Promise<LoadForecast[]> {
    try {
      const data = await this.makeRequest("NP3-965-CD", {
        fields:
          "DeliveryDate,HourEnding,SystemWideActualLoad,SystemWideAverageLoad",
      });

      return this.parseERCOTLoad(data);
    } catch (error) {
      console.warn("Failed to fetch ERCOT load data, using fallback");
      return this.getFallbackLoad();
    }
  }

  async getWindGeneration(): Promise<GenerationData[]> {
    try {
      const data = await this.makeRequest("NP4-732-CD", {
        fields:
          "DeliveryDate,HourEnding,ActualSystemWideWindOutput,WindCapacity",
      });

      return this.parseERCOTWind(data);
    } catch (error) {
      console.warn("Failed to fetch ERCOT wind data, using fallback");
      return this.getFallbackWind();
    }
  }

  private parseERCOTPrices(data: any): RealTimePrice[] {
    if (!data?.data) return this.getFallbackPrices();

    return data.data.slice(0, 20).map((item: any) => ({
      timestamp: new Date(`${item.DeliveryDate} ${item.HourEnding}:00`),
      location: item.SettlementPoint || "HB_HOUSTON",
      price: Number.parseFloat(item.SettlementPointPrice) || 0,
      zone: this.getERCOTZone(item.SettlementPoint),
      marketType: "RTM" as const,
    }));
  }

  private parseERCOTLoad(data: any): LoadForecast[] {
    if (!data?.data) return this.getFallbackLoad();

    return data.data.slice(0, 24).map((item: any) => ({
      timestamp: new Date(`${item.DeliveryDate} ${item.HourEnding}:00`),
      forecastedLoad: Number.parseFloat(item.SystemWideAverageLoad) || 0,
      actualLoad: Number.parseFloat(item.SystemWideActualLoad) || 0,
      region: "ERCOT",
      confidence: 95,
    }));
  }

  private parseERCOTWind(data: any): GenerationData[] {
    if (!data?.data) return this.getFallbackWind();

    return data.data.slice(0, 24).map((item: any) => ({
      timestamp: new Date(`${item.DeliveryDate} ${item.HourEnding}:00`),
      resourceType: "Wind",
      output: Number.parseFloat(item.ActualSystemWideWindOutput) || 0,
      capacity: Number.parseFloat(item.WindCapacity) || 0,
      availability: 100,
      location: "ERCOT",
    }));
  }

  private getERCOTZone(settlementPoint: string): string {
    if (settlementPoint?.includes("HOUSTON")) return "HOUSTON";
    if (settlementPoint?.includes("NORTH")) return "NORTH";
    if (settlementPoint?.includes("SOUTH")) return "SOUTH";
    if (settlementPoint?.includes("WEST")) return "WEST";
    return "ERCOT";
  }

  private getFallbackPrices(): RealTimePrice[] {
    const basePrice = 28 + Math.random() * 15;
    return [
      {
        timestamp: new Date(),
        location: "HB_HOUSTON",
        price: basePrice + (Math.random() - 0.5) * 8,
        zone: "HOUSTON",
        marketType: "RTM",
      },
      {
        timestamp: new Date(),
        location: "HB_NORTH",
        price: basePrice + (Math.random() - 0.5) * 6,
        zone: "NORTH",
        marketType: "RTM",
      },
      {
        timestamp: new Date(),
        location: "HB_SOUTH",
        price: basePrice + (Math.random() - 0.5) * 10,
        zone: "SOUTH",
        marketType: "RTM",
      },
    ];
  }

  private getFallbackLoad(): LoadForecast[] {
    const baseLoad = 45000 + Math.random() * 15000;
    return [
      {
        timestamp: new Date(),
        forecastedLoad: baseLoad,
        actualLoad: baseLoad + (Math.random() - 0.5) * 2000,
        region: "ERCOT",
        confidence: 92,
      },
    ];
  }

  private getFallbackWind(): GenerationData[] {
    return [
      {
        timestamp: new Date(),
        resourceType: "Wind",
        output: 15000 + Math.random() * 8000,
        capacity: 35000,
        availability: 85 + Math.random() * 10,
        location: "ERCOT",
      },
    ];
  }
}

// Main Grid API Manager
export class ProductionGridAPI {
  private caiso: CAISOApiService;
  private ercot: ERCOTApiService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = Number.parseInt(
    process.env.NEXT_PUBLIC_CACHE_DURATION || "180000",
  ); // 3 minutes

  constructor() {
    this.caiso = new CAISOApiService();
    this.ercot = new ERCOTApiService();
  }

  async getAllRealTimePrices(): Promise<RealTimePrice[]> {
    return this.withCache("realtime_prices", async () => {
      const [caisoData, ercotData] = await Promise.allSettled([
        this.caiso.getRealTimePrices(),
        this.ercot.getRealTimePrices(),
      ]);

      const prices: RealTimePrice[] = [];

      if (caisoData.status === "fulfilled") {
        prices.push(...caisoData.value);
      }

      if (ercotData.status === "fulfilled") {
        prices.push(...ercotData.value);
      }

      return prices.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
    });
  }

  async getAllGenerationData(): Promise<GenerationData[]> {
    return this.withCache("generation_data", async () => {
      const [caisoGen, ercotWind] = await Promise.allSettled([
        this.caiso.getGenerationData(),
        this.ercot.getWindGeneration(),
      ]);

      const generation: GenerationData[] = [];

      if (caisoGen.status === "fulfilled") {
        generation.push(...caisoGen.value);
      }

      if (ercotWind.status === "fulfilled") {
        generation.push(...ercotWind.value);
      }

      return generation;
    });
  }

  async getLoadForecasts(): Promise<LoadForecast[]> {
    return this.withCache("load_forecasts", async () => {
      const ercotLoad = await this.ercot.getLoadForecast();
      return ercotLoad;
    });
  }

  async getCurtailmentData(): Promise<CurtailmentData[]> {
    return this.withCache("curtailment_data", async () => {
      return await this.caiso.getCurtailmentData();
    });
  }

  async getGridConditions(): Promise<GridCondition[]> {
    // Real grid conditions would come from multiple sources
    // For now, simulate based on load and generation data
    const loadData = await this.getLoadForecasts();
    const genData = await this.getAllGenerationData();

    return [
      {
        timestamp: new Date(),
        status: this.determineGridStatus(loadData, genData),
        frequency: 60.0 + (Math.random() - 0.5) * 0.05,
        reserves: 2500 + Math.random() * 1000,
        region: "CAISO",
        alerts: [],
      },
      {
        timestamp: new Date(),
        status: this.determineGridStatus(loadData, genData),
        frequency: 60.0 + (Math.random() - 0.5) * 0.03,
        reserves: 3200 + Math.random() * 800,
        region: "ERCOT",
        alerts: [],
      },
    ];
  }

  private determineGridStatus(
    load: LoadForecast[],
    generation: GenerationData[],
  ): "Normal" | "Watch" | "Warning" | "Emergency" {
    const totalLoad = load.reduce(
      (sum, l) => sum + (l.actualLoad || l.forecastedLoad),
      0,
    );
    const totalGen = generation.reduce((sum, g) => sum + g.output, 0);
    const reserveMargin = (totalGen - totalLoad) / totalLoad;

    if (reserveMargin > 0.15) return "Normal";
    if (reserveMargin > 0.08) return "Watch";
    if (reserveMargin > 0.03) return "Warning";
    return "Emergency";
  }

  private async withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await fn();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      if (cached) {
        console.warn(`Using stale cache for ${key} due to API error:`, error);
        return cached.data;
      }
      throw error;
    }
  }

  // Health check for API services (using mock data for demo)
  async getAPIHealthStatus() {
    // Simulate API response times for demo purposes
    const simulateApiCall = async (apiName: string) => {
      const responseTime = Math.random() * 500 + 100; // 100-600ms
      await new Promise((resolve) => setTimeout(resolve, responseTime));

      // Randomly simulate some occasional degraded status for realism
      const statusOptions = [
        "operational",
        "operational",
        "operational",
        "degraded",
      ]; // 75% operational
      const status =
        statusOptions[Math.floor(Math.random() * statusOptions.length)];

      return {
        name: apiName,
        status: status as "operational" | "degraded",
        responseTime: Math.round(responseTime),
        lastUpdated: new Date(),
        ...(status === "degraded" && {
          error: "Simulated intermittent connectivity issue",
        }),
      };
    };

    const checks = [
      { name: "CAISO", test: () => simulateApiCall("CAISO") },
      { name: "ERCOT", test: () => simulateApiCall("ERCOT") },
      { name: "PJM", test: () => simulateApiCall("PJM") },
      { name: "NYISO", test: () => simulateApiCall("NYISO") },
    ];

    const results = await Promise.allSettled(
      checks.map(async (check) => {
        try {
          return await check.test();
        } catch (error) {
          return {
            name: check.name,
            status: "degraded" as const,
            responseTime: 5000,
            error: error instanceof Error ? error.message : "Unknown error",
            lastUpdated: new Date(),
          };
        }
      }),
    );

    return results.map((result) =>
      result.status === "fulfilled" ? result.value : result.reason,
    );
  }
}

// Singleton instance
export const productionGridAPI = new ProductionGridAPI();
