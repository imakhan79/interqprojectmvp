import { useState } from "react";
import { 
  Users, Briefcase, FileText, Calendar, TrendingUp, 
  ArrowRight, CheckCircle, AlertCircle, DollarSign, 
  Building2, UserCheck, Activity, BarChart3, Globe, Shield 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockKPIs, mockJobs, mockActivityFeed, mockCompanies } from "@/data/adminModuleData";

const stats = {
  totalJobSeekers: mockKPIs.totalCandidates,
  activeCompanies: mockCompanies.filter(c => c.status === "active").length,
  totalCompanies: mockCompanies.length,
  totalRecruiters: mockKPIs.totalRecruiters,
  totalActiveJobs: mockKPIs.activeJobs,
  totalApplications: mockKPIs.totalCandidates * 3,
  totalAssessmentsAssigned: 892,
  totalInterviewsScheduled: mockKPIs.interviewsScheduled,
  totalOffersSent: mockKPIs.offersSent,
  totalHires: mockKPIs.hiresCompleted,
  pendingApprovals: mockKPIs.pendingApprovals,
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState([
    { id: "1", name: "TechStart Inc", type: "Company verification", icon: "building" },
    { id: "2", name: "Sarah Johnson", type: "TAP certification", icon: "user" },
    { id: "3", name: "MediCare Solutions", type: "Company verification", icon: "building" },
  ]);

  const handleApproval = (id: string, name: string, action: "approve" | "reject") => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    toast({
      title: action === "approve" ? "Approved" : "Rejected",
      description: `${name} has been ${action === "approve" ? "approved" : "rejected"}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Platform overview and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => toast({ title: "Report Generated", description: "Platform report has been exported." })}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </button>
          <button
            onClick={() => window.location.href = "/settings"}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin Settings
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Candidates</p>
              <p className="text-3xl font-bold mt-1">{stats.totalJobSeekers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-blue-100">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+847 this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Active Companies</p>
              <p className="text-3xl font-bold mt-1">{stats.activeCompanies}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-emerald-100">
            <span>of {stats.totalCompanies} total</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Expert TAPs</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRecruiters}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100">Active Jobs</p>
              <p className="text-3xl font-bold mt-1">{stats.totalActiveJobs}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm text-amber-100">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+124 this week</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: stats.totalApplications.toLocaleString(), sub: "All time", icon: FileText, color: "indigo" },
          { label: "Assessments", value: stats.totalAssessmentsAssigned.toLocaleString(), sub: "Assigned", icon: Activity, color: "purple" },
          { label: "Interviews", value: stats.totalInterviewsScheduled, sub: "Scheduled", icon: Calendar, color: "cyan" },
          { label: "Offers Sent", value: stats.totalOffersSent, sub: `${stats.totalHires} hires`, icon: DollarSign, color: "emerald" },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{item.label}</h3>
              <div className={`w-10 h-10 bg-${item.color}-50 rounded-lg flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 text-${item.color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm text-gray-500 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Analytics Strip */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Platform Analytics</h2>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Live</span>
            </div>
            <button
              onClick={() => window.location.href = "/reports"}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
            >
              Detailed Report <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { value: "68%", label: "Job Seeker Retention", icon: Users, color: "blue" },
              { value: "24 days", label: "Avg Time to Hire", icon: Briefcase, color: "emerald" },
              { value: "73%", label: "Offer Acceptance", icon: CheckCircle, color: "purple" },
              { value: "42", label: "Countries", icon: Globe, color: "amber" },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className={`w-16 h-16 mx-auto bg-${item.color}-50 rounded-full flex items-center justify-center mb-3`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {approvals.length} pending
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {approvals.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-sm">All approvals handled!</p>
              </div>
            ) : approvals.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.icon === "building" ? "bg-emerald-100" : "bg-blue-100"}`}>
                    {item.icon === "building"
                      ? <Building2 className="w-5 h-5 text-emerald-600" />
                      : <UserCheck className="w-5 h-5 text-blue-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleApproval(item.id, item.name, "approve")}
                    className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(item.id, item.name, "reject")}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button
                onClick={() => window.location.href = "/audit-logs"}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {mockActivityFeed.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-400">{activity.userName} · {new Date(activity.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
