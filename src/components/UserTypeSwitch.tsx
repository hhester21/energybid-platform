"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth, type UserType, getAvailableFeatures } from "@/lib/auth-context";
import {
  User,
  Factory,
  Zap,
  Settings,
  ChevronDown,
  CheckCircle
} from "lucide-react";

const userTypeInfo = {
  producer: {
    icon: Factory,
    title: "Energy Producer",
    description: "Renewable, industrial, and behind-the-fence energy providers",
    color: "bg-green-100 text-green-800 border-green-300",
    examples: ["Solar Farms Inc", "ExxonMobil Energy Trading", "Shell Chemical", "Freeport LNG Terminal"]
  },
  consumer: {
    icon: Zap,
    title: "Energy Consumer",
    description: "Companies buying energy for EV charging, data centers, mining",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    examples: ["Tesla Supercharger", "Google AI Center", "CleanSpark Mining"]
  },
  operator: {
    icon: Settings,
    title: "Grid Operator",
    description: "Utility companies managing grid stability and operations",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    examples: ["CAISO", "ERCOT", "GridOps Utility"]
  }
};

export function UserTypeSwitch() {
  const { user, switchUserType } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const currentTypeInfo = userTypeInfo[user.userType];
  const CurrentIcon = currentTypeInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <CurrentIcon className="h-4 w-4" />
          <span>{currentTypeInfo.title}</span>
          <Badge variant="secondary" className="text-xs">
            Demo
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Switch User Type - Demo Mode</DialogTitle>
          <DialogDescription>
            Experience EnergyBid from different perspectives. Each user type has unique features and access levels.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(userTypeInfo).map(([type, info]) => {
            const Icon = info.icon;
            const isActive = user.userType === type;

            return (
              <Card
                key={type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => {
                  switchUserType(type as UserType);
                  setIsOpen(false);
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{info.title}</span>
                    </div>
                    {isActive && <CheckCircle className="h-5 w-5 text-blue-500" />}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{info.description}</p>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Example Companies:</p>
                    <div className="space-y-1">
                      {info.examples.slice(0, 2).map((example, index) => (
                        <p key={index} className="text-xs text-gray-500">• {example}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Key Features:</p>
                    <div className="space-y-1">
                      {getAvailableFeatures({
                        ...user,
                        userType: type as UserType
                      }).slice(0, 3).map((feature, index) => (
                        <p key={index} className="text-xs text-gray-500">• {feature}</p>
                      ))}
                    </div>
                  </div>

                  {isActive && (
                    <Badge className={info.color} variant="outline">
                      Current Role
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <div className="flex items-start space-x-2">
            <User className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Demo Mode Active</p>
              <p className="text-xs text-yellow-700">
                This allows you to experience different user perspectives. In production,
                user types are set during registration and verified through our KYC process.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
