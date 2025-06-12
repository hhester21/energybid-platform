"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Shield,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Eye,
  Plus,
  ExternalLink,
  Coins,
  Activity,
  Zap,
  Settings,
  Users,
  BarChart3
} from "lucide-react";
import {
  smartContractManager,
  type EnergyContract,
  type EscrowDetails,
  type SmartContractEvent,
  type ContractTemplate
} from "@/lib/smart-contracts";
import { useAuth } from "@/lib/auth-context";

const contractTypes = [
  { value: "spot", label: "Spot Contract", description: "Immediate energy delivery" },
  { value: "futures", label: "Futures Contract", description: "Future energy delivery" },
  { value: "recurring", label: "Recurring Contract", description: "Recurring energy deliveries" }
];

const blockchainNetworks = [
  { value: "energy-web-chain", label: "Energy Web Chain", description: "Specialized for energy trading" },
  { value: "polygon", label: "Polygon", description: "Low-cost Ethereum scaling" },
  { value: "ethereum", label: "Ethereum", description: "Main Ethereum network" }
];

export function SmartContractsDashboard() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<EnergyContract[]>([]);
  const [escrows, setEscrows] = useState<Map<string, EscrowDetails>>(new Map());
  const [events, setEvents] = useState<SmartContractEvent[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedContract, setSelectedContract] = useState<EnergyContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateContract, setShowCreateContract] = useState(false);

  // New contract form state
  const [newContract, setNewContract] = useState({
    type: "spot",
    buyer: "",
    seller: "",
    energyAmount: "",
    pricePerMWh: "",
    deliveryStart: "",
    deliveryEnd: "",
    blockchain: "energy-web-chain",
    autoRenewal: false
  });

  const loadContractsData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Initialize smart contract manager
      await smartContractManager.initialize();

      // Load contracts
      const allContracts = smartContractManager.getAllContracts();
      setContracts(allContracts);

      // Load escrows
      const escrowMap = new Map<string, EscrowDetails>();
      for (const contract of allContracts) {
        const escrow = smartContractManager.getEscrow(contract.id);
        if (escrow) {
          escrowMap.set(contract.id, escrow);
        }
      }
      setEscrows(escrowMap);

      // Load events for selected contract
      if (selectedContract) {
        const contractEvents = await smartContractManager.getContractEvents(selectedContract.id);
        setEvents(contractEvents);
      }

      // Load templates
      setTemplates(smartContractManager.getContractTemplates());
    } catch (error) {
      console.error("Failed to load contracts data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedContract]);

  useEffect(() => {
    loadContractsData();
    const interval = setInterval(loadContractsData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadContractsData]);

  const handleCreateContract = async () => {
    if (!user) return;

    try {
      const deliveryStart = new Date(newContract.deliveryStart);
      const deliveryEnd = new Date(newContract.deliveryEnd);

      const contract = await smartContractManager.createEnergyContract(
        newContract.buyer || user.name,
        newContract.seller,
        Number.parseFloat(newContract.energyAmount),
        Number.parseFloat(newContract.pricePerMWh),
        deliveryStart,
        deliveryEnd,
        {
          autoRenewal: newContract.autoRenewal,
          settlementMethod: "automatic"
        }
      );

      // Reset form
      setNewContract({
        type: "spot",
        buyer: "",
        seller: "",
        energyAmount: "",
        pricePerMWh: "",
        deliveryStart: "",
        deliveryEnd: "",
        blockchain: "energy-web-chain",
        autoRenewal: false
      });

      setShowCreateContract(false);
      loadContractsData();
    } catch (error) {
      console.error("Failed to create contract:", error);
    }
  };

  const handleReleaseMilestone = async (contractId: string, milestoneId: string) => {
    try {
      await smartContractManager.releaseMilestone(contractId, milestoneId);
      loadContractsData();
    } catch (error) {
      console.error("Failed to release milestone:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      case "disputed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getEscrowStatusColor = (status: string) => {
    switch (status) {
      case "funded": return "bg-green-100 text-green-800";
      case "partial": return "bg-yellow-100 text-yellow-800";
      case "released": return "bg-blue-100 text-blue-800";
      case "disputed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const stats = smartContractManager.getContractStats();

  if (!user) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Smart Contract Management</h3>
          <p className="text-gray-500">Sign in to access automated trading contracts and escrow services.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Contracts Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Smart Contract Management</span>
          </h2>
          <p className="text-gray-600">Automated energy trading with blockchain-secured settlements</p>
        </div>
        <Dialog open={showCreateContract} onOpenChange={setShowCreateContract}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Smart Contract</DialogTitle>
              <DialogDescription>Deploy a new energy trading contract to the blockchain</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract-type">Contract Type</Label>
                  <Select
                    value={newContract.type}
                    onValueChange={(value) => setNewContract(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="blockchain">Blockchain Network</Label>
                  <Select
                    value={newContract.blockchain}
                    onValueChange={(value) => setNewContract(prev => ({ ...prev, blockchain: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blockchainNetworks.map(network => (
                        <SelectItem key={network.value} value={network.value}>
                          <div>
                            <div className="font-medium">{network.label}</div>
                            <div className="text-xs text-gray-500">{network.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyer">Buyer</Label>
                  <Input
                    id="buyer"
                    placeholder="Buyer address or name"
                    value={newContract.buyer}
                    onChange={(e) => setNewContract(prev => ({ ...prev, buyer: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="seller">Seller</Label>
                  <Input
                    id="seller"
                    placeholder="Seller address or name"
                    value={newContract.seller}
                    onChange={(e) => setNewContract(prev => ({ ...prev, seller: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="energy-amount">Energy Amount (MWh)</Label>
                  <Input
                    id="energy-amount"
                    type="number"
                    placeholder="25.5"
                    value={newContract.energyAmount}
                    onChange={(e) => setNewContract(prev => ({ ...prev, energyAmount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per MWh ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="28.50"
                    value={newContract.pricePerMWh}
                    onChange={(e) => setNewContract(prev => ({ ...prev, pricePerMWh: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery-start">Delivery Start</Label>
                  <Input
                    id="delivery-start"
                    type="datetime-local"
                    value={newContract.deliveryStart}
                    onChange={(e) => setNewContract(prev => ({ ...prev, deliveryStart: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery-end">Delivery End</Label>
                  <Input
                    id="delivery-end"
                    type="datetime-local"
                    value={newContract.deliveryEnd}
                    onChange={(e) => setNewContract(prev => ({ ...prev, deliveryEnd: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-renewal"
                  checked={newContract.autoRenewal}
                  onChange={(e) => setNewContract(prev => ({ ...prev, autoRenewal: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="auto-renewal">Enable automatic contract renewal</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={handleCreateContract}
                  className="flex-1"
                  disabled={!newContract.seller || !newContract.energyAmount || !newContract.pricePerMWh}
                >
                  Deploy Contract
                </Button>
                <Button variant="outline" onClick={() => setShowCreateContract(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contract Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Contracts</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalContracts}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Contracts</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeContracts}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Energy Traded</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalEnergyTraded} MWh</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="contracts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
          <TabsTrigger value="contracts">Active Contracts</TabsTrigger>
          <TabsTrigger value="escrow">Escrow Management</TabsTrigger>
          <TabsTrigger value="events">Blockchain Events</TabsTrigger>
        </TabsList>

        {/* Active Contracts Tab */}
        <TabsContent value="contracts" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Smart Contracts</span>
              </CardTitle>
              <CardDescription>Manage your energy trading contracts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Smart Contracts</h3>
                    <p className="text-gray-500 mb-4">Create your first automated energy trading contract.</p>
                    <Button onClick={() => setShowCreateContract(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Contract
                    </Button>
                  </div>
                ) : (
                  contracts.map((contract) => (
                    <div key={contract.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{contract.buyer} ↔ {contract.seller}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(contract.status)}>
                              {contract.status.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {contract.blockchain.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">${contract.totalValue.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{contract.energyAmount} MWh</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Contract Type</p>
                          <p className="font-medium capitalize">{contract.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price per MWh</p>
                          <p className="font-medium">${contract.pricePerMWh.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Delivery Start</p>
                          <p className="font-medium">{contract.deliveryStart.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Delivery End</p>
                          <p className="font-medium">{contract.deliveryEnd.toLocaleDateString()}</p>
                        </div>
                      </div>

                      {contract.contractAddress && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                          <Shield className="h-4 w-4" />
                          <span>Contract: {contract.contractAddress}</span>
                          <Button size="sm" variant="outline" className="h-6 px-2">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {contract.status === "active" && (
                            <>
                              <Button size="sm" variant="outline">
                                Execute Delivery
                              </Button>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </>
                          )}
                          {contract.status === "disputed" && (
                            <Button size="sm" variant="destructive">
                              Resolve Dispute
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Created {contract.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escrow Management Tab */}
        <TabsContent value="escrow" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Escrow Management</span>
              </CardTitle>
              <CardDescription>Monitor escrow funds and milestone releases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(escrows.entries()).length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Escrows</h3>
                    <p className="text-gray-500">Escrow accounts will be created for high-value contracts automatically.</p>
                  </div>
                ) : (
                  Array.from(escrows.entries()).map(([contractId, escrow]) => {
                    const contract = contracts.find(c => c.id === contractId);
                    if (!contract) return null;

                    return (
                      <div key={contractId} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{contract.buyer} ↔ {contract.seller}</h3>
                            <Badge className={getEscrowStatusColor(escrow.status)}>
                              {escrow.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">${escrow.totalAmount.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Escrow Total</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-500">Buyer Deposit</p>
                            <p className="font-medium">${escrow.buyerDeposit.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Seller Bond</p>
                            <p className="font-medium">${escrow.sellerBond.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Milestones</p>
                            <p className="font-medium">
                              {escrow.milestones.filter(m => m.completed).length}/{escrow.milestones.length}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Milestone Progress</h4>
                          {escrow.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{milestone.description}</p>
                                <p className="text-sm text-gray-500">{milestone.condition}</p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium">{milestone.percentage}%</span>
                                {milestone.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleReleaseMilestone(contractId, milestone.id)}
                                  >
                                    Release
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Events Tab */}
        <TabsContent value="events" className="mt-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <span>Blockchain Events</span>
              </CardTitle>
              <CardDescription>Transaction history and contract events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Transaction History</h3>
                    <p className="text-gray-500">Contract events and blockchain transactions will appear here.</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {event.eventType === "created" && <Plus className="h-5 w-5 text-blue-500" />}
                        {event.eventType === "funded" && <DollarSign className="h-5 w-5 text-green-500" />}
                        {event.eventType === "delivery_started" && <Zap className="h-5 w-5 text-orange-500" />}
                        {event.eventType === "delivery_completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {event.eventType === "payment_released" && <Coins className="h-5 w-5 text-purple-500" />}
                        {event.eventType === "disputed" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{event.eventType.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">
                          Block #{event.blockNumber} • {event.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {event.transactionHash.slice(0, 10)}...
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
