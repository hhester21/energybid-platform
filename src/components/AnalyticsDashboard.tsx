"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Leaf,
  DollarSign,
  Zap,
  Clock,
  Target,
  Award,
  Sun,
  Wind,
  Droplets
} from "lucide-react";

// Sample data for charts
const energyConsumptionData = [
  { month: "Jan", solar: 45, wind: 35, hydro: 20, total: 100 },
  { month: "Feb", solar: 52, wind: 28, hydro: 25, total: 105 },
  { month: "Mar", solar: 65, wind: 42, hydro: 18, total: 125 },
  { month: "Apr", solar: 78, wind: 38, hydro: 22, total: 138 },
  { month: "May", solar: 85, wind: 45, hydro: 28, total: 158 },
  { month: "Jun", solar: 92, wind: 52, hydro: 24, total: 168 }
];

const costSavingsData = [
  { month: "Jan", traditional: 12500, renewable: 8200, savings: 4300 },
  { month: "Feb", traditional: 13200, renewable: 8900, savings: 4300 },
  { month: "Mar", traditional: 15600, renewable: 10200, savings: 5400 },
  { month: "Apr", traditional: 17200, renewable: 11800, savings: 5400 },
  { month: "May", traditional: 19700, renewable: 12400, savings: 7300 },
  { month: "Jun", traditional: 21000, renewable: 13600, savings: 7400 }
];

const energySourceDistribution = [
  { name: "Solar", value: 45, color: "#FCD34D" },
  { name: "Wind", value: 35, color: "#60A5FA" },
  { name: "Hydro", value: 20, color: "#34D399" }
];

const biddingSuccessData = [
  { week: "Week 1", won: 8, lost: 3, success: 73 },
  { week: "Week 2", won: 12, lost: 2, success: 86 },
  { week: "Week 3", won: 10, lost: 4, success: 71 },
  { week: "Week 4", won: 15, lost: 2, success: 88 }
];

const COLORS = ['#FCD34D', '#60A5FA', '#34D399', '#F87171'];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Savings</p>
                <p className="text-2xl font-bold text-green-600">$7,400</p>
                <p className="text-xs text-green-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Energy Efficiency</p>
                <p className="text-2xl font-bold text-blue-600">94.2%</p>
                <p className="text-xs text-blue-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% improvement
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bid Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">88%</p>
                <p className="text-xs text-purple-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Above industry avg
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Green Credits</p>
                <p className="text-2xl font-bold text-orange-600">156</p>
                <p className="text-xs text-orange-500 flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  +24 this month
                </p>
              </div>
              <Leaf className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Consumption Trends */}
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Energy Consumption by Source</span>
            </CardTitle>
            <CardDescription>Monthly breakdown by renewable energy type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={energyConsumptionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value} MWh`, name]} />
                <Area
                  type="monotone"
                  dataKey="solar"
                  stackId="1"
                  stroke="#FCD34D"
                  fill="#FCD34D"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="wind"
                  stackId="1"
                  stroke="#60A5FA"
                  fill="#60A5FA"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="hydro"
                  stackId="1"
                  stroke="#34D399"
                  fill="#34D399"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center space-x-1">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Solar</span>
              </div>
              <div className="flex items-center space-x-1">
                <Wind className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Wind</span>
              </div>
              <div className="flex items-center space-x-1">
                <Droplets className="h-4 w-4 text-green-500" />
                <span className="text-sm">Hydro</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Savings Analysis */}
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Cost Savings Analysis</span>
            </CardTitle>
            <CardDescription>Traditional vs renewable energy costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costSavingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, ""]} />
                <Line
                  type="monotone"
                  dataKey="traditional"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="renewable"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <Badge variant="outline" className="text-red-600 border-red-300">
                Traditional Cost
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-300">
                Renewable Cost
              </Badge>
              <Badge variant="outline" className="text-purple-600 border-purple-300">
                Savings
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Energy Source Distribution */}
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <span>Energy Source Distribution</span>
            </CardTitle>
            <CardDescription>Current month renewable energy mix</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={energySourceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {energySourceDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {energySourceDistribution.map((source) => (
                <div key={source.name} className="text-center">
                  <div
                    className="w-4 h-4 rounded mx-auto mb-1"
                    style={{ backgroundColor: source.color }}
                  />
                  <p className="text-sm font-medium">{source.name}</p>
                  <p className="text-xs text-gray-500">{source.value}%</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bidding Success Rate */}
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Bidding Performance</span>
            </CardTitle>
            <CardDescription>Weekly bidding success rates and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={biddingSuccessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="won" fill="#10B981" name="Won Bids" />
                <Bar dataKey="lost" fill="#EF4444" name="Lost Bids" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <Badge variant="outline" className="text-green-600 border-green-300">
                Won Bids
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300">
                Lost Bids
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Market Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Peak bidding hours:</span>
              <Badge variant="secondary">2-4 PM PST</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg. energy price:</span>
              <span className="font-medium text-green-600">$0.014/kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Next opportunity:</span>
              <Badge variant="outline" className="text-orange-600">
                <Clock className="h-3 w-3 mr-1" />
                45m
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">CO₂ avoided:</span>
              <span className="font-medium text-green-600">89.4 tons</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Trees equivalent:</span>
              <span className="font-medium text-green-600">2,235 trees</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Carbon credits:</span>
              <Badge variant="outline" className="text-blue-600">
                <Award className="h-3 w-3 mr-1" />
                156 credits
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                // Simulate report export
                const reportData = {
                  period: "Last 30 days",
                  totalSavings: "$127,500",
                  energyConsumed: "342.8 MWh",
                  co2Reduced: "89.4t",
                  greenCredits: 156
                };

                const report = `EnergyBid Analytics Report
${reportData.period}

💰 Total Savings: ${reportData.totalSavings}
⚡ Energy Consumed: ${reportData.energyConsumed}
🌱 CO₂ Reduced: ${reportData.co2Reduced}
🏆 Green Credits: ${reportData.greenCredits}

Generated on: ${new Date().toLocaleDateString()}`;

                // Create downloadable file
                const blob = new Blob([report], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'energybid-analytics-report.txt';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                if (typeof window !== "undefined" && Notification.permission === "granted") {
                  new Notification("Report Exported! 📊", {
                    body: "Analytics report downloaded successfully",
                    icon: "⚡"
                  });
                }
              }}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                // Navigate to watchlist for alert management
                const watchlistTab = document.querySelector('[value="watchlist"]') as HTMLElement;
                if (watchlistTab) {
                  watchlistTab.click();
                }
                if (typeof window !== "undefined" && Notification.permission === "granted") {
                  new Notification("Setting Up Alerts! 🔔", {
                    body: "Configure price alerts in the watchlist",
                    icon: "⚡"
                  });
                }
              }}
            >
              <Target className="h-4 w-4 mr-2" />
              Set Alerts
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                // Navigate to certificates tab
                const certsTab = document.querySelector('[value="certificates"]') as HTMLElement;
                if (certsTab) {
                  certsTab.click();
                } else {
                  alert("🏆 Green Certificates\n\nYour certificates:\n• 156 total green credits\n• 15 earned this week\n• 89.4t CO₂ reduced\n• 100% renewable energy\n\nFull certificate management available in the main dashboard.");
                }
                if (typeof window !== "undefined" && Notification.permission === "granted") {
                  new Notification("Viewing Certificates! 🏆", {
                    body: "Your green energy certificates and achievements",
                    icon: "⚡"
                  });
                }
              }}
            >
              <Award className="h-4 w-4 mr-2" />
              View Certificates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
