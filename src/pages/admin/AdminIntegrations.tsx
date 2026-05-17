import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plug, Video, Mail, Calendar, Users, Search, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const integrations = [
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Schedule and host video interviews directly from the platform",
    icon: Video,
    color: "text-green-600 bg-green-50",
    status: "connected",
    category: "Video Conferencing",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Connect Zoom for seamless video interviews and meetings",
    icon: Video,
    color: "text-blue-600 bg-blue-50",
    status: "disconnected",
    category: "Video Conferencing",
  },
  {
    id: "ms-teams",
    name: "Microsoft Teams",
    description: "Integrate with Microsoft Teams for enterprise-grade video calls",
    icon: Users,
    color: "text-purple-600 bg-purple-50",
    status: "disconnected",
    category: "Video Conferencing",
  },
  {
    id: "gmail",
    name: "Gmail / Google Workspace",
    description: "Send automated emails and notifications via Gmail",
    icon: Mail,
    color: "text-red-600 bg-red-50",
    status: "connected",
    category: "Email",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Transactional email delivery for verification and notifications",
    icon: Mail,
    color: "text-blue-600 bg-blue-50",
    status: "disconnected",
    category: "Email",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync interview schedules with Google Calendar",
    icon: Calendar,
    color: "text-amber-600 bg-amber-50",
    status: "connected",
    category: "Calendar",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Source candidates and post jobs directly to LinkedIn",
    icon: Search,
    color: "text-blue-700 bg-blue-50",
    status: "disconnected",
    category: "Job Boards",
  },
  {
    id: "zoho",
    name: "Zoho CRM",
    description: "Sync candidate and company data with Zoho CRM",
    icon: Users,
    color: "text-orange-600 bg-orange-50",
    status: "disconnected",
    category: "CRM",
  },
];

export default function AdminIntegrations() {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(integrations.map((i) => [i.id, i.status]))
  );
  const [apiKey, setApiKey] = useState("");

  const handleToggle = (id: string) => {
    const next = statuses[id] === "connected" ? "disconnected" : "connected";
    setStatuses((prev) => ({ ...prev, [id]: next }));
    toast({
      title: next === "connected" ? "Integration connected" : "Integration disconnected",
      description: `${integrations.find((i) => i.id === id)?.name} has been ${next === "connected" ? "connected" : "disconnected"}.`,
    });
  };

  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">Connect third-party services to extend platform functionality</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.values(statuses).filter((s) => s === "connected").length}</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <AlertCircle className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.values(statuses).filter((s) => s === "disconnected").length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Plug className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{integrations.length}</p>
              <p className="text-sm text-muted-foreground">Total Integrations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrations
              .filter((i) => i.category === category)
              .map((integration) => {
                const Icon = integration.icon;
                const isConnected = statuses[integration.id] === "connected";
                return (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${integration.color.split(" ")[1]}`}>
                        <Icon className={`h-5 w-5 ${integration.color.split(" ")[0]}`} />
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={isConnected ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"}
                      >
                        {isConnected ? "Connected" : "Disconnected"}
                      </Badge>
                      <Switch checked={isConnected} onCheckedChange={() => handleToggle(integration.id)} />
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Use the API key below to connect custom integrations or third-party tools.</p>
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={apiKey || "sk-interq-••••••••••••••••••••••••••••••••"}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
                readOnly
              />
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText("sk-interq-example-key-here");
                toast({ title: "Copied", description: "API key copied to clipboard." });
              }}>Copy</Button>
              <Button variant="outline" onClick={() => toast({ title: "Key regenerated", description: "A new API key has been generated." })}>
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
