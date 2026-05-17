import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, AlertTriangle, CheckCircle, Lock, Eye, EyeOff, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const recentEvents = [
  { type: "login", description: "Successful admin login", ip: "192.168.1.1", time: "2 min ago", severity: "low" },
  { type: "failed", description: "Failed login attempt", ip: "203.45.67.89", time: "15 min ago", severity: "high" },
  { type: "password", description: "Password changed", ip: "192.168.1.1", time: "1 hour ago", severity: "medium" },
  { type: "login", description: "New device login detected", ip: "10.0.0.5", time: "3 hours ago", severity: "medium" },
];

export default function AdminSecurity() {
  const { toast } = useToast();
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSave = (setting: string) => {
    toast({ title: "Settings saved", description: `${setting} settings have been updated.` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage authentication, access control, and security settings</p>
      </div>

      {/* Security Score */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="h-7 w-7 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-800">Security Score: 78/100</p>
              <p className="text-sm text-green-700">Good — Enable IP whitelisting to reach 95+</p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">Good</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Multi-Factor Authentication (MFA)</p>
              <p className="text-sm text-muted-foreground">Require MFA for all admin accounts</p>
            </div>
            <Switch checked={mfaEnabled} onCheckedChange={(v) => { setMfaEnabled(v); handleSave("MFA"); }} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Session Timeout</p>
              <p className="text-sm text-muted-foreground">Auto-logout after 24 hours of inactivity</p>
            </div>
            <Switch checked={sessionTimeout} onCheckedChange={(v) => { setSessionTimeout(v); handleSave("Session timeout"); }} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">IP Whitelisting</p>
              <p className="text-sm text-muted-foreground">Restrict admin access to specific IP ranges</p>
            </div>
            <Switch checked={ipWhitelist} onCheckedChange={(v) => { setIpWhitelist(v); handleSave("IP whitelist"); }} />
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Password Length</Label>
              <Input type="number" defaultValue={8} min={6} max={32} />
            </div>
            <div className="space-y-2">
              <Label>Password Expiry (days)</Label>
              <Input type="number" defaultValue={90} min={30} max={365} />
            </div>
          </div>
          <div className="space-y-3">
            {["Require uppercase letters", "Require numbers", "Require special characters", "Prevent password reuse (last 5)"].map((rule) => (
              <div key={rule} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-sm">{rule}</p>
              </div>
            ))}
          </div>
          <Button onClick={() => handleSave("Password policy")}>Save Policy</Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Admin Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input type={showCurrentPassword ? "text" : "password"} placeholder="Enter current password" className="pr-10" />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input type={showNewPassword ? "text" : "password"} placeholder="Enter new password" className="pr-10" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button onClick={() => handleSave("Password")}>Update Password</Button>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${event.severity === "high" ? "bg-red-50" : event.severity === "medium" ? "bg-yellow-50" : "bg-green-50"}`}>
                    {event.severity === "high" ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.description}</p>
                    <p className="text-xs text-muted-foreground">IP: {event.ip}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={
                      event.severity === "high"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : event.severity === "medium"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }
                  >
                    {event.severity}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
