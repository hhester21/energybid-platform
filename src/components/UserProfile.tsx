"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  Building,
  Zap,
  Award,
} from "lucide-react";
import { AccountSettings } from "@/components/AccountSettings";
import { NotificationCenter } from "@/components/NotificationCenter";
import { BillingManagement } from "@/components/BillingManagement";
import { useAuth } from "@/lib/auth-context";

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    company: string;
    role: string;
    tier: "Basic" | "Premium" | "Enterprise";
    avatar?: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const { signOut } = useAuth();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Basic":
        return "bg-gray-100 text-gray-800";
      case "Premium":
        return "bg-blue-100 text-blue-800";
      case "Enterprise":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMenuItemClick = (action: string) => {
    setIsOpen(false);

    switch (action) {
      case "profile":
        setActiveDialog("profile");
        break;
      case "notifications":
        setActiveDialog("notifications");
        break;
      case "billing":
        setActiveDialog("billing");
        break;
      case "settings":
        setActiveDialog("settings");
        break;
      case "security":
        setActiveDialog("security");
        break;
      case "help":
        setActiveDialog("help");
        break;
      case "logout":
        signOut();
        break;
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {user.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      className={getTierColor(user.tier)}
                      variant="secondary"
                    >
                      {user.tier}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-300"
                    >
                      <Building className="h-3 w-3 mr-1" />
                      {user.company}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Quick Stats */}
          <div className="px-2 py-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1 text-green-600">
                <Zap className="h-3 w-3" />
                <span>234 MWh saved</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <Award className="h-3 w-3" />
                <span>12 certificates</span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleMenuItemClick("profile")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleMenuItemClick("notifications")}
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleMenuItemClick("billing")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleMenuItemClick("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleMenuItemClick("security")}
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => handleMenuItemClick("help")}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={() => handleMenuItemClick("logout")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Settings Dialog */}
      <Dialog
        open={activeDialog === "profile"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Update your profile information and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.role}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Company</label>
                <p className="text-sm text-gray-600">{user.company}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Plan</label>
                <Badge className={getTierColor(user.tier)}>{user.tier}</Badge>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  alert(
                    "👤 Edit Profile\n\nProfile editing functionality would include:\n• Update name and email\n• Change company information\n• Upload profile picture\n• Update preferences\n• Modify notification settings\n\nThis would open a comprehensive profile editor in a production environment.",
                  );
                  setActiveDialog(null);
                }}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog
        open={activeDialog === "notifications"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Center</DialogTitle>
            <DialogDescription>
              Manage your notification preferences and view recent alerts.
            </DialogDescription>
          </DialogHeader>
          <NotificationCenter />
        </DialogContent>
      </Dialog>

      {/* Billing Dialog */}
      <Dialog
        open={activeDialog === "billing"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Billing Management</DialogTitle>
            <DialogDescription>
              View your subscription details, usage, and payment history.
            </DialogDescription>
          </DialogHeader>
          <BillingManagement />
        </DialogContent>
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog
        open={activeDialog === "settings"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Configure your account preferences and privacy settings.
            </DialogDescription>
          </DialogHeader>
          <AccountSettings />
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog
        open={activeDialog === "security"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Security Settings</DialogTitle>
            <DialogDescription>
              Manage your password, two-factor authentication, and security
              preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    alert(
                      "🔐 Change Password\n\nPassword change would include:\n• Current password verification\n• New password requirements\n• Password strength indicator\n• Confirmation step\n• Email notification\n\nThis would open a secure password change form in production.",
                    );
                  }}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status: Not enabled</span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      alert(
                        "🔒 Two-Factor Authentication\n\n2FA setup would include:\n• QR code for authenticator app\n• Backup codes generation\n• Phone number verification\n• Test authentication\n• Recovery options\n\nThis would guide you through secure 2FA setup in production.",
                      );
                    }}
                  >
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Login Activity</CardTitle>
                <CardDescription>Recent login sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current session</span>
                    <span className="text-green-600">Active now</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chrome on MacOS</span>
                    <span className="text-gray-500">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help & Support Dialog */}
      <Dialog
        open={activeDialog === "help"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>
              Get help with EnergyBid and contact our support team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => window.open("/docs", "_blank")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Documentation</h3>
                    <p className="text-sm text-gray-500">
                      Learn how to use EnergyBid
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => window.open("mailto:support@energybid.com")}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Contact Support</h3>
                    <p className="text-sm text-gray-500">
                      Get help from our team
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">System Status</h3>
                    <p className="text-sm text-gray-500">
                      Check platform health
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setActiveDialog(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
