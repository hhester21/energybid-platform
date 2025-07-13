"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Clock,
  Lightbulb,
  Zap,
  DollarSign,
  Activity,
  RefreshCw,
  Eye,
  BarChart3,
  Cpu,
} from "lucide-react";
import {
  aiForecastingEngine,
  type PricePrediction,
  type SurplusForecast,
  type MarketOpportunity,
  type AIMarketInsights,
  type ForecastingModel,
} from "@/lib/ai-forecasting";
import { energyDataService } from "@/lib/energy-data";
import { useAuth } from "@/lib/auth-context";

const energyTypes = ["Solar", "Wind", "Hydro", "Natural Gas", "Cogeneration"];
const timeHorizons = [
  { value: "1h", label: "Next Hour" },
  { value: "4h", label: "Next 4 Hours" },
  { value: "24h", label: "Next 24 Hours" },
  { value: "7d", label: "Next 7 Days" },
];

export function AIInsightsDashboard() {
  const { user } = useAuth();
  const [selectedEnergyType, setSelectedEnergyType] = useState("Solar");
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState<
    "1h" | "4h" | "24h" | "7d"
  >("24h");
  const [pricePredictions, setPricePredictions] = useState<PricePrediction[]>(
    [],
  );
  const [surplusForecasts, setSurplusForecasts] = useState<SurplusForecast[]>(
    [],
  );
  const [marketOpportunities, setMarketOpportunities] = useState<
    MarketOpportunity[]
  >([]);
  const [marketInsights, setMarketInsights] = useState<AIMarketInsights | null>(
    null,
  );
  const [models, setModels] = useState<ForecastingModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAIData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get current energy data for analysis
      const energyBlocks = await energyDataService.getAllEnergyBlocks();
      const gridData = await energyDataService.getGridData();

      // Load AI predictions and insights
      const [predictions, opportunities, insights] = await Promise.all([
        aiForecastingEngine.predictPrice(
          selectedEnergyType,
          selectedTimeHorizon,
        ),
        aiForecastingEngine.analyzeOpportunities(energyBlocks),
        aiForecastingEngine.generateMarketInsights(energyBlocks, gridData),
      ]);

      // Load surplus forecasts for all energy types
      const forecasts = await Promise.all(
        energyTypes.map((type) =>
          aiForecastingEngine.forecastSurplus(type, selectedTimeHorizon),
        ),
      );

      setPricePredictions(predictions);
      setMarketOpportunities(opportunities);
      setMarketInsights(insights);
      setSurplusForecasts(forecasts);
      setModels(aiForecastingEngine.getModelStats());
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load AI data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEnergyType, selectedTimeHorizon]);

  useEffect(() => {
    loadAIData();
    const interval = setInterval(loadAIData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [loadAIData]);

  const handleTrainModels = async () => {
    try {
      setIsTraining(true);
      const energyBlocks = await energyDataService.getAllEnergyBlocks();
      await aiForecastingEngine.trainModels(energyBlocks);
      setModels(aiForecastingEngine.getModelStats());
    } catch (error) {
      console.error("Model training failed:", error);
    } finally {
      setIsTraining(false);
    }
  };

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case "price_drop":
        return TrendingDown;
      case "high_availability":
        return Zap;
      case "low_competition":
        return Target;
      case "arbitrage":
        return DollarSign;
      default:
        return Lightbulb;
    }
  };

  const getOpportunityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-100 border-red-300";
      case "medium":
        return "text-orange-600 bg-orange-100 border-orange-300";
      case "low":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      default:
        return "text-blue-600 bg-blue-100 border-blue-300";
    }
  };

  const getMarketTrendColor = (trend: string) => {
    switch (trend) {
      case "bullish":
        return "text-green-600 bg-green-100";
      case "bearish":
        return "text-red-600 bg-red-100";
      case "neutral":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const formatPredictionData = () => {
    return pricePredictions.map((pred, index) => ({
      time: pred.timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: pred.predictedPrice,
      confidence: pred.confidence,
      min: pred.priceRange.min,
      max: pred.priceRange.max,
      hour: pred.timestamp.getHours(),
    }));
  };

  if (!user) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            AI-Powered Market Intelligence
          </h3>
          <p className="text-gray-500">
            Sign in to access advanced forecasting and market insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>AI Market Intelligence</span>
          </h2>
          <p className="text-gray-600">
            Advanced forecasting and predictive analytics for energy markets
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={loadAIData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button size="sm" onClick={handleTrainModels} disabled={isTraining}>
            {isTraining ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Cpu className="h-4 w-4 mr-2" />
            )}
            {isTraining ? "Training..." : "Train Models"}
          </Button>
        </div>
      </div>

      {/* Market Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Market Trend
                </p>
                <Badge
                  className={`mt-1 ${marketInsights ? getMarketTrendColor(marketInsights.marketTrend) : "bg-gray-100"}`}
                >
                  {marketInsights?.marketTrend.toUpperCase() || "LOADING"}
                </Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Opportunities
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {marketOpportunities.length}
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Model Accuracy
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {models.length > 0
                    ? Math.round(
                        models.reduce((sum, m) => sum + m.accuracy, 0) /
                          models.length,
                      )
                    : 0}
                  %
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Risk Level</p>
                <p className="text-2xl font-bold text-orange-600">
                  {marketInsights?.riskLevel || 0}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main AI Tabs */}
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="predictions">Price Predictions</TabsTrigger>
          <TabsTrigger value="opportunities">Market Opportunities</TabsTrigger>
          <TabsTrigger value="forecasts">Surplus Forecasts</TabsTrigger>
          <TabsTrigger value="models">AI Models</TabsTrigger>
        </TabsList>

        {/* Price Predictions Tab */}
        <TabsContent value="predictions" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <span>Price Prediction Analysis</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={selectedEnergyType}
                        onValueChange={setSelectedEnergyType}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {energyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedTimeHorizon}
                        onValueChange={(value: string) =>
                          setSelectedTimeHorizon(
                            value as "1h" | "4h" | "24h" | "7d",
                          )
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeHorizons.map((horizon) => (
                            <SelectItem
                              key={horizon.value}
                              value={horizon.value}
                            >
                              {horizon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardDescription>
                    AI-powered price predictions with confidence intervals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formatPredictionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis
                          tickFormatter={(value) => `$${value.toFixed(3)}`}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            name === "price"
                              ? `$${value.toFixed(3)}/kWh`
                              : name === "confidence"
                                ? `${value}%`
                                : `$${value.toFixed(3)}`,
                            name === "price"
                              ? "Predicted Price"
                              : name === "confidence"
                                ? "Confidence"
                                : name === "min"
                                  ? "Min Range"
                                  : "Max Range",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="min"
                          stackId="1"
                          stroke="none"
                          fill="#E5E7EB"
                          fillOpacity={0.4}
                        />
                        <Area
                          type="monotone"
                          dataKey="max"
                          stackId="1"
                          stroke="none"
                          fill="#E5E7EB"
                          fillOpacity={0.4}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {pricePredictions.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Current Price</p>
                        <p className="font-bold text-lg">
                          ${pricePredictions[0]?.predictedPrice.toFixed(3)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Peak Price</p>
                        <p className="font-bold text-lg text-red-600">
                          $
                          {Math.max(
                            ...pricePredictions.map((p) => p.predictedPrice),
                          ).toFixed(3)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Low Price</p>
                        <p className="font-bold text-lg text-green-600">
                          $
                          {Math.min(
                            ...pricePredictions.map((p) => p.predictedPrice),
                          ).toFixed(3)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Avg. Confidence</p>
                        <p className="font-bold text-lg text-purple-600">
                          {Math.round(
                            pricePredictions.reduce(
                              (sum, p) => sum + p.confidence,
                              0,
                            ) / pricePredictions.length,
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Market Insights Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Market Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {marketInsights && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Liquidity Score
                        </p>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={marketInsights.liquidityScore}
                            className="flex-1"
                          />
                          <span className="text-sm font-bold">
                            {marketInsights.liquidityScore}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Competition Level
                        </p>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={marketInsights.competitionLevel}
                            className="flex-1"
                          />
                          <span className="text-sm font-bold">
                            {marketInsights.competitionLevel}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Volatility
                        </p>
                        <Badge
                          className={
                            marketInsights.volatility === "high"
                              ? "bg-red-100 text-red-800"
                              : marketInsights.volatility === "medium"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {marketInsights.volatility.toUpperCase()}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Recommended Strategy
                        </p>
                        <Badge
                          className={
                            marketInsights.recommendedStrategy === "aggressive"
                              ? "bg-red-100 text-red-800"
                              : marketInsights.recommendedStrategy ===
                                  "conservative"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {marketInsights.recommendedStrategy.toUpperCase()}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">
                          Key Factors
                        </p>
                        <div className="space-y-1">
                          {marketInsights.keyFactors.map((factor) => (
                            <p key={factor} className="text-xs text-gray-600">
                              • {factor}
                            </p>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Market Opportunities Tab */}
        <TabsContent value="opportunities" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>AI-Identified Market Opportunities</span>
              </CardTitle>
              <CardDescription>
                Real-time analysis of trading opportunities based on market
                conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketOpportunities.length === 0 ? (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Opportunities Detected
                    </h3>
                    <p className="text-gray-500">
                      AI is monitoring the market for new opportunities.
                    </p>
                  </div>
                ) : (
                  marketOpportunities.map((opportunity) => {
                    const OpportunityIcon = getOpportunityIcon(
                      opportunity.opportunityType,
                    );
                    return (
                      <div
                        key={opportunity.id}
                        className={`border rounded-lg p-4 ${getOpportunityColor(opportunity.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <OpportunityIcon className="h-6 w-6" />
                            <div>
                              <h3 className="font-semibold">
                                {opportunity.energyType} -{" "}
                                {opportunity.location}
                              </h3>
                              <p className="text-sm opacity-80">
                                {opportunity.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {opportunity.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {opportunity.confidence}% confidence
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <p className="opacity-70">Potential Savings</p>
                            <p className="font-bold">
                              ${opportunity.potentialSavings.toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="opacity-70">Time to Act</p>
                            <p className="font-bold">
                              {opportunity.timeToAct}m
                            </p>
                          </div>
                          <div>
                            <p className="opacity-70">Opportunity Type</p>
                            <p className="font-bold capitalize">
                              {opportunity.opportunityType.replace("_", " ")}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                // Execute recommended action based on opportunity type
                                if (
                                  opportunity.recommendedAction
                                    .toLowerCase()
                                    .includes("bid")
                                ) {
                                  const biddingTab = document.querySelector(
                                    '[value="bidding"]',
                                  ) as HTMLElement;
                                  if (biddingTab) {
                                    biddingTab.click();
                                  }
                                } else if (
                                  opportunity.recommendedAction
                                    .toLowerCase()
                                    .includes("watch")
                                ) {
                                  const watchlistTab = document.querySelector(
                                    '[value="watchlist"]',
                                  ) as HTMLElement;
                                  if (watchlistTab) {
                                    watchlistTab.click();
                                  }
                                } else {
                                  alert(
                                    `🤖 AI Recommendation\n\nOpportunity: ${opportunity.opportunityType.replace("_", " ")}\nConfidence: ${opportunity.confidence}%\nPotential Savings: $${opportunity.potentialSavings.toLocaleString()}\n\nAction: ${opportunity.recommendedAction}\n\nThis AI insight would trigger the appropriate action in a production environment.`,
                                  );
                                }

                                if (
                                  typeof window !== "undefined" &&
                                  Notification.permission === "granted"
                                ) {
                                  new Notification("AI Action Executed! 🤖", {
                                    body: `Following AI recommendation: ${opportunity.recommendedAction}`,
                                    icon: "⚡",
                                  });
                                }
                              }}
                            >
                              {opportunity.recommendedAction}
                            </Button>
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

        {/* Surplus Forecasts Tab */}
        <TabsContent value="forecasts" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Surplus Energy Forecasts</span>
              </CardTitle>
              <CardDescription>
                Predicted surplus energy availability by source type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {surplusForecasts.map((forecast) => (
                  <div
                    key={forecast.energyType}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">
                        {forecast.energyType}
                      </h3>
                      <Badge variant="outline">
                        {forecast.probability}% probability
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Expected Surplus
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {forecast.expectedSurplus} MWh
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Curtailment Risk
                        </p>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={forecast.curtailmentRisk}
                            className="flex-1"
                          />
                          <span className="text-sm font-bold">
                            {forecast.curtailmentRisk}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Peak Times</p>
                        <div className="flex flex-wrap gap-1">
                          {forecast.peakTimes.map((time) => (
                            <Badge
                              key={time}
                              variant="secondary"
                              className="text-xs"
                            >
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="models" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>AI Model Performance</span>
              </CardTitle>
              <CardDescription>
                Machine learning model statistics and training history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.map((model) => (
                  <div
                    key={model.name}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{model.name}</h3>
                      <Badge
                        className={
                          model.accuracy > 90
                            ? "bg-green-100 text-green-800"
                            : model.accuracy > 80
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {model.accuracy.toFixed(1)}% accuracy
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Last Trained</p>
                        <p className="font-medium">
                          {model.lastTrained.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Predictions Made</p>
                        <p className="font-medium">
                          {model.predictions.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Features</p>
                        <p className="font-medium">{model.features.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <Badge variant="outline" className="text-green-600">
                          Active
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Training Features:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {model.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Model Training Information
                </h4>
                <p className="text-sm text-blue-700">
                  AI models are continuously trained on market data to improve
                  prediction accuracy. Training incorporates weather patterns,
                  demand cycles, generation capacity, and historical price
                  movements.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
