"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// User types for the energy marketplace
export type UserType = "producer" | "consumer" | "operator";

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  userType: UserType;
  tier: "Basic" | "Premium" | "Enterprise";
  verified: boolean;
  avatar?: string;
  metadata: {
    industry?: string; // For consumers: "EV Charging", "AI Data Center", "Bitcoin Mining", "HPC"
    resourceTypes?: string[]; // For producers: ["Solar", "Wind", "Hydro", "Natural Gas", "LNG", "Industrial Steam", "Cogeneration"]
    facilityType?: string; // "Renewable", "Refinery", "Chemical Plant", "LNG Terminal", "Industrial Complex"
    gridRegion?: string; // "CAISO", "ERCOT", "PJM", etc.
    capacity?: number; // MW capacity
    certifications?: string[]; // Green certifications
    behindTheFence?: boolean; // For industrial producers offering on-site power
    proximityRadius?: number; // km radius for behind-the-fence opportunities
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: Partial<User>) => Promise<void>;
  signOut: () => void;
  updateProfile: (updates: Partial<User>) => void;
  switchUserType: (userType: UserType) => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for different types
const demoUsers: User[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@cleanenergyco.com",
    company: "CleanEnergy Co",
    userType: "consumer",
    tier: "Enterprise",
    verified: true,
    metadata: {
      industry: "EV Charging",
      gridRegion: "CAISO",
      capacity: 50,
      certifications: ["Green-e Certified", "LEED Gold"]
    }
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    email: "m.rodriguez@solarfarmsinc.com",
    company: "Solar Farms Inc",
    userType: "producer",
    tier: "Premium",
    verified: true,
    metadata: {
      resourceTypes: ["Solar"],
      facilityType: "Renewable",
      gridRegion: "CAISO",
      capacity: 250,
      certifications: ["REC Certified", "Carbon Neutral"]
    }
  },
  {
    id: "3",
    name: "Emily Johnson",
    email: "emily.johnson@gridops.com",
    company: "GridOps Utility",
    userType: "operator",
    tier: "Enterprise",
    verified: true,
    metadata: {
      gridRegion: "ERCOT",
      capacity: 15000,
      certifications: ["NERC Certified", "ISO Compliant"]
    }
  },
  {
    id: "4",
    name: "James Carter",
    email: "j.carter@exxonmobil.com",
    company: "ExxonMobil Energy Trading",
    userType: "producer",
    tier: "Enterprise",
    verified: true,
    metadata: {
      resourceTypes: ["Cogeneration", "Natural Gas"],
      facilityType: "Refinery",
      gridRegion: "ERCOT",
      capacity: 150,
      behindTheFence: true,
      proximityRadius: 5,
      certifications: ["ISO 50001", "Energy Efficiency"]
    }
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: demoUsers[0], // Start with consumer user for demo
    isAuthenticated: true, // Start authenticated for demo
    loading: false
  });

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user by email
    const user = demoUsers.find(u => u.email === email);
    if (user) {
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
      throw new Error("Invalid credentials");
    }
  };

  const signUp = async (userData: Partial<User>) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || "",
      email: userData.email || "",
      company: userData.company || "",
      userType: userData.userType || "consumer",
      tier: userData.tier || "Basic",
      verified: false,
      metadata: userData.metadata || {}
    };

    setAuthState({
      user: newUser,
      isAuthenticated: true,
      loading: false
    });
  };

  const signOut = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false
    });
  };

  const updateProfile = (updates: Partial<User>) => {
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null
      }));
    }
  };

  const switchUserType = (userType: UserType) => {
    const user = demoUsers.find(u => u.userType === userType);
    if (user) {
      setAuthState(prev => ({ ...prev, user }));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signIn,
      signUp,
      signOut,
      updateProfile,
      switchUserType
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Role-based access control helpers
export function hasPermission(user: User | null, action: string): boolean {
  if (!user) return false;

  const permissions = {
    producer: [
      "list_energy",
      "view_bids",
      "manage_listings",
      "create_listings",
      "view_analytics",
      "export_data"
    ],
    consumer: [
      "place_bids",
      "view_marketplace",
      "view_analytics",
      "manage_consumption",
      "view_certificates"
    ],
    operator: [
      "view_grid_data",
      "manage_demand_response",
      "view_all_analytics",
      "moderate_marketplace",
      "access_admin"
    ]
  };

  return permissions[user.userType]?.includes(action) || false;
}

export function getAvailableFeatures(user: User | null): string[] {
  if (!user) return [];

  const features = {
    producer: [
      "Energy Listings",
      "Bid Management",
      "Revenue Analytics",
      "Curtailment Alerts",
      "Green Certificates"
    ],
    consumer: [
      "Energy Marketplace",
      "Bidding System",
      "Cost Analytics",
      "Consumption Tracking",
      "Sustainability Reports"
    ],
    operator: [
      "Grid Monitoring",
      "Demand Response",
      "Market Oversight",
      "System Analytics",
      "Regulatory Compliance"
    ]
  };

  return features[user.userType] || [];
}
