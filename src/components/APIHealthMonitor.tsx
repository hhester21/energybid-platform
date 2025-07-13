"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity,
} from "lucide-react";
import { productionGridAPI } from "@/lib/grid-apis";

interface APIStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  responseTime: number;
  lastUpdated: Date;
  error?: string;
}

export function APIHealthMonitor() {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkAPIHealth = async () => {
    setIsChecking(true);
    try {
      const healthData = await productionGridAPI.getAPIHealthStatus();
      setApiStatuses(healthData as APIStatus[]);
      setLastCheck(new Date());
    } catch (error) {
      console.error("Health check failed:", error);
      setApiStatuses([
        {
          name: "CAISO",
          status: "down",
          responseTime: 0,
          lastUpdated: new Date(),
          error: "Health check failed",
        },
        {
          name: "ERCOT",
          status: "down",
          responseTime: 0,
          lastUpdated: new Date(),
          error: "Health check failed",
        },
      ]);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAPIHealth();
    // Check every 5 minutes
    const interval = setInterval(checkAPIHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAPIHealth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "down":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "down":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  // Check if we're in production mode
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION_MODE === "true";

  if (!isProduction) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Development Mode - Using Demo Data
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Production API Status</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {lastCheck && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Last check: {lastCheck.toLocaleTimeString()}
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={checkAPIHealth}
              disabled={isChecking}
            >
              <RefreshCw
                className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiStatuses.map((api) => (
            <div
              key={api.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(api.status)}
                <div>
                  <h3 className="font-semibold">{api.name} Grid API</h3>
                  <p className="text-sm text-gray-500">
                    Real-time energy market data
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{api.responseTime}ms</p>
                  <p className="text-xs text-gray-500">Response time</p>
                </div>

                <Badge className={getStatusColor(api.status)}>
                  {api.status.toUpperCase()}
                </Badge>
              </div>

              {api.error && (
                <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                  Error: {api.error}
                </div>
              )}
            </div>
          ))}

          {apiStatuses.length === 0 && (
            <div className="text-center py-4">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Checking API status...</p>
            </div>
          )}

          {/* Overall system status */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">System Status</h4>
                <p className="text-sm text-gray-600">
                  {apiStatuses.every((api) => api.status === "operational")
                    ? "All systems operational"
                    : apiStatuses.some((api) => api.status === "operational")
                      ? "Partial system degradation"
                      : "System experiencing issues"}
                </p>
              </div>

              <div className="flex items-center space-x-1">
                {apiStatuses.every((api) => api.status === "operational") ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                )}
              </div>
            </div>
          </div>

          {/* Data sources info */}
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
            <strong>Data Sources:</strong>
            <br />
            • CAISO: California Independent System Operator - Real-time pricing
            and generation data
            <br />
            • ERCOT: Electric Reliability Council of Texas - Load forecasts and
            wind generation data
            <br />
            <strong>Update Frequency:</strong> Real-time data refreshes every
            1-5 minutes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
