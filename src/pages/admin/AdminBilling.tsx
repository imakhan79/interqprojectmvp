import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, TrendingUp, Users, Package, CheckCircle, Download } from "lucide-react";

const plans = [
  { name: "Basic", price: "$49/mo", users: 5, jobs: 10, current: false },
  { name: "Professional", price: "$149/mo", users: 25, jobs: 50, current: true },
  { name: "Enterprise", price: "$499/mo", users: "Unlimited", jobs: "Unlimited", current: false },
];

const invoices = [
  { id: "INV-001", date: "May 1, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-002", date: "Apr 1, 2026", amount: "$149.00", status: "Paid" },
  { id: "INV-003", date: "Mar 1, 2026", amount: "$149.00", status: "Paid" },
];

export default function AdminBilling() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your subscription and payment details</p>
      </div>

      {/* Current Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">12 <span className="text-lg text-muted-foreground font-normal">/ 25</span></p>
            <Progress value={48} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">48% used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">23 <span className="text-lg text-muted-foreground font-normal">/ 50</span></p>
            <Progress value={46} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">46% used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Next Billing</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">$149</p>
            <p className="text-xs text-muted-foreground mt-2">Due Jun 1, 2026</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Subscription Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-5 rounded-xl border-2 ${plan.current ? "border-primary bg-primary/5" : "border-muted"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.current && <Badge>Current</Badge>}
                </div>
                <p className="text-2xl font-bold mb-4">{plan.price}</p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {plan.users} users</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> {plan.jobs} job postings</li>
                </ul>
                {!plan.current && (
                  <Button variant="outline" className="w-full">Switch Plan</Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-muted rounded-lg">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{inv.id}</p>
                  <p className="text-sm text-muted-foreground">{inv.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{inv.amount}</span>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{inv.status}</Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
