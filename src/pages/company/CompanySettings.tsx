import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Building2, Users, CreditCard, Shield, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CompanySettings() {
  const { company } = useOutletContext<{ company: { id: string; name: string } }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your company workspace settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general"><Building2 className="h-4 w-4 mr-2" /> General</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" /> Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" /> Security</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="h-4 w-4 mr-2" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue={company.name} />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input defaultValue="Technology" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input defaultValue="https://techcorp.com" />
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Input defaultValue="500-1000 employees" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-dashed border-primary/20">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm">Change Logo</Button>
                    <p className="text-[10px] text-muted-foreground">JPG, PNG or SVG. Max size 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "New Applications", desc: "Notify when a candidate applies" },
                { title: "Interview Reminders", desc: "Alert 1 hour before scheduled interviews" },
                { title: "Weekly Report", desc: "Email summary of hiring activity" },
                { title: "Member Activity", desc: "Notify when team members perform actions" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={i < 2} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>You are currently on the Enterprise plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 border rounded-2xl bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">Enterprise</h3>
                    <p className="text-sm text-muted-foreground">Unlimited jobs and candidates</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">Active</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>TAP Seats</span>
                    <span className="font-semibold">25 / Unlimited</span>
                  </div>
                  <Progress value={25} className="h-1.5" />
                </div>
                <Button className="w-full mt-6" variant="outline">Manage Subscription</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
