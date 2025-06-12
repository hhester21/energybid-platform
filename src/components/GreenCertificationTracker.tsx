"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Leaf,
  Shield,
  Calendar,
  Zap,
  TrendingUp,
  CheckCircle,
  Clock,
  ExternalLink,
  Download
} from "lucide-react";

interface GreenCertificate {
  id: string;
  type: "Carbon Credit" | "Renewable Energy Certificate" | "Green Energy Badge";
  amount: number;
  unit: string;
  issueDate: Date;
  expiryDate: Date;
  blockchain: {
    hash: string;
    network: string;
    verified: boolean;
  };
  energySource: "Solar" | "Wind" | "Hydro";
  status: "active" | "expired" | "pending";
  tradeable: boolean;
  value: number;
}

const mockCertificates: GreenCertificate[] = [
  {
    id: "REC-2024-001",
    type: "Renewable Energy Certificate",
    amount: 25.5,
    unit: "MWh",
    issueDate: new Date("2024-01-15"),
    expiryDate: new Date("2025-01-15"),
    blockchain: {
      hash: "0x3f7b..8d9c",
      network: "Energy Web Chain",
      verified: true
    },
    energySource: "Solar",
    status: "active",
    tradeable: true,
    value: 127.50
  },
  {
    id: "CC-2024-002",
    type: "Carbon Credit",
    amount: 15.2,
    unit: "tCO2",
    issueDate: new Date("2024-02-20"),
    expiryDate: new Date("2026-02-20"),
    blockchain: {
      hash: "0x8c4a..5f1e",
      network: "Polygon",
      verified: true
    },
    energySource: "Wind",
    status: "active",
    tradeable: true,
    value: 456.00
  },
  {
    id: "GEB-2024-003",
    type: "Green Energy Badge",
    amount: 100,
    unit: "%",
    issueDate: new Date("2024-03-10"),
    expiryDate: new Date("2024-06-10"),
    blockchain: {
      hash: "0x2e8b..4a7c",
      network: "Energy Web Chain",
      verified: true
    },
    energySource: "Hydro",
    status: "active",
    tradeable: false,
    value: 0
  }
];

const getSourceColor = (source: string) => {
  switch (source) {
    case "Solar":
      return "text-yellow-600 bg-yellow-100";
    case "Wind":
      return "text-blue-600 bg-blue-100";
    case "Hydro":
      return "text-cyan-600 bg-cyan-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-100";
    case "expired":
      return "text-red-600 bg-red-100";
    case "pending":
      return "text-orange-600 bg-orange-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export function GreenCertificationTracker() {
  const [selectedCert, setSelectedCert] = useState<GreenCertificate | null>(null);

  const totalValue = mockCertificates.reduce((sum, cert) => sum + cert.value, 0);
  const activeCerts = mockCertificates.filter(cert => cert.status === "active").length;
  const totalCarbon = mockCertificates
    .filter(cert => cert.type === "Carbon Credit")
    .reduce((sum, cert) => sum + cert.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Certificates</p>
                <p className="text-2xl font-bold text-green-600">{activeCerts}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
                <p className="text-2xl font-bold text-blue-600">${totalValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Carbon Offset</p>
                <p className="text-2xl font-bold text-purple-600">{totalCarbon.toFixed(1)}t</p>
              </div>
              <Leaf className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Verification Rate</p>
                <p className="text-2xl font-bold text-orange-600">100%</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="certificates" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="certificates">My Certificates</TabsTrigger>
          <TabsTrigger value="marketplace">Trade Marketplace</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Certificates List */}
            <div className="lg:col-span-2">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span>Green Certificates Portfolio</span>
                  </CardTitle>
                  <CardDescription>
                    Blockchain-verified renewable energy and carbon credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="border rounded-lg p-4 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                        onClick={() => setSelectedCert(cert)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Award className="h-6 w-6 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">{cert.type}</h3>
                              <p className="text-sm text-gray-500">ID: {cert.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(cert.status)}>
                              {cert.status.toUpperCase()}
                            </Badge>
                            {cert.blockchain.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="font-bold">{cert.amount} {cert.unit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Source</p>
                            <Badge className={getSourceColor(cert.energySource)} variant="secondary">
                              {cert.energySource}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Issue Date</p>
                            <p className="font-medium">{cert.issueDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Value</p>
                            <p className="font-bold text-green-600">
                              {cert.value > 0 ? `$${cert.value.toFixed(2)}` : "Non-tradeable"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-600">
                              Verified on {cert.blockchain.network}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {cert.tradeable && (
                              <Button size="sm" variant="outline">
                                Trade
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certificate Details Sidebar */}
            <div className="space-y-6">
              {selectedCert ? (
                <Card className="bg-white/60 backdrop-blur-sm border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span>Certificate Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Certificate ID</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedCert.id}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Blockchain Hash</p>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded truncate">
                        {selectedCert.blockchain.hash}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Network</p>
                      <p className="text-sm">{selectedCert.blockchain.network}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Validity Period</p>
                      <p className="text-sm">
                        {selectedCert.issueDate.toLocaleDateString()} - {selectedCert.expiryDate.toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          // Create downloadable certificate
                          const certData = `GREEN ENERGY CERTIFICATE
Certificate ID: ${cert.id}
Type: ${cert.type}
Amount: ${cert.amount} MWh
Date: ${cert.date}
Verification: ${cert.verificationStatus}

This certificate represents verified renewable energy consumption
and carbon footprint reduction through the EnergyBid platform.

Generated on: ${new Date().toLocaleDateString()}`;

                          const blob = new Blob([certData], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.style.display = 'none';
                          a.href = url;
                          a.download = `green-certificate-${cert.id}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);

                          if (typeof window !== "undefined" && Notification.permission === "granted") {
                            new Notification("Certificate Downloaded! 📄", {
                              body: `Green certificate ${cert.id} downloaded successfully`,
                              icon: "🏆"
                            });
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          // Simulate blockchain verification
                          alert(`🔍 Certificate Verification\n\nCertificate ID: ${cert.id}\nType: ${cert.type}\nAmount: ${cert.amount} MWh\nStatus: ${cert.verificationStatus}\n\nBlockchain Hash: 0x${Math.random().toString(16).substring(2, 10)}\nTimestamp: ${cert.date}\n\n✅ Certificate verified on blockchain\n🌍 Carbon credits: ${(cert.amount * 0.4).toFixed(1)}t CO₂`);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/60 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select a certificate to view details</p>
                  </CardContent>
                </Card>
              )}

              {/* Progress to Next Level */}
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Progress to Gold Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={75} className="w-full" />
                    <div className="flex justify-between text-sm">
                      <span>Current: Silver</span>
                      <span>Next: Gold (500 MWh)</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      125 MWh remaining to unlock premium trading features
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Green Certificate Marketplace</CardTitle>
              <CardDescription>
                Trade verified green certificates with other organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trading Platform Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Buy and sell green certificates on our blockchain-powered marketplace.
                  Get early access notifications when we launch.
                </p>
                <Button className="mt-4">
                  Join Waitlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Blockchain Verification</span>
              </CardTitle>
              <CardDescription>
                All certificates are verified on blockchain networks for transparency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div>
                          <h3 className="font-semibold">Energy Web Chain</h3>
                          <p className="text-sm text-gray-500">2 certificates verified</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div>
                          <h3 className="font-semibold">Polygon Network</h3>
                          <p className="text-sm text-gray-500">1 certificate verified</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-600" />
                    Verification Process
                  </h4>
                  <ol className="text-sm space-y-1 text-gray-600">
                    <li>1. Energy consumption data is collected from smart meters</li>
                    <li>2. Renewable source is verified by grid operators</li>
                    <li>3. Certificate is minted on blockchain with immutable record</li>
                    <li>4. Third-party auditor validates the certificate</li>
                    <li>5. Certificate becomes tradeable on marketplace</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
