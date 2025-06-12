"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Globe, Zap, Database, ExternalLink } from "lucide-react";

export function ProductionBanner() {
  const isProduction = process.env.NEXT_PUBLIC_PRODUCTION_MODE === "true";

  if (!isProduction) {
    return null; // Don't show in development
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-green-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-green-600" />
              <Badge className="bg-green-100 text-green-800 border-green-300">
                🔴 LIVE PRODUCTION
              </Badge>
            </div>

            <div className="text-sm text-gray-700">
              <span className="font-medium">Real-time energy market data from:</span>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1">
                  <Activity className="h-3 w-3 text-blue-600" />
                  <span>CAISO (California)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-orange-600" />
                  <span>ERCOT (Texas)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Database className="h-3 w-3 text-purple-600" />
                  <span>Live Grid APIs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open("https://oasis.caiso.com", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              CAISO
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open("https://www.ercot.com", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              ERCOT
            </Button>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600 bg-white/70 p-2 rounded">
          <strong>Production Features Active:</strong>
          ⚡ Real-time energy pricing • 🌱 Live renewable generation data • 📊 Grid demand forecasting •
          🔥 Curtailment monitoring • 🤖 AI-powered market analysis • ⛓️ Blockchain smart contracts •
          📱 Mobile-responsive trading interface
        </div>
      </CardContent>
    </Card>
  );
}
