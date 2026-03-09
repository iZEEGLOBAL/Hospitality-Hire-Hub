import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Briefcase, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Eye,
  MousePointer,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/axios';

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics');
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform performance and insights</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const stats = analytics?.overview || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Users" 
          value={stats.totalUsers || 0} 
          change={stats.userGrowth || 0}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard 
          title="Active Jobs" 
          value={stats.activeJobs || 0} 
          change={stats.jobGrowth || 0}
          icon={<Briefcase className="h-6 w-6" />}
          color="green"
        />
        <MetricCard 
          title="Revenue" 
          value={`$${(stats.totalRevenue || 0).toLocaleString()}`} 
          change={stats.revenueGrowth || 0}
          icon={<DollarSign className="h-6 w-6" />}
          color="purple"
        />
        <MetricCard 
          title="Applications" 
          value={stats.totalApplications || 0} 
          change={stats.applicationGrowth || 0}
          icon={<Activity className="h-6 w-6" />}
          color="orange"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Users (Today)</span>
                    <span className="font-semibold">{stats.newUsersToday || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Users (This Week)</span>
                    <span className="font-semibold">{stats.newUsersThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Users (This Month)</span>
                    <span className="font-semibold">{stats.newUsersThisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Sessions</span>
                    <span className="font-semibold">{stats.activeSessions || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Job Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Jobs Posted</span>
                    <span className="font-semibold">{stats.totalJobs || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Approval</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingJobs || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Applications</span>
                    <span className="font-semibold">{stats.totalApplications || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Applications per Job</span>
                    <span className="font-semibold">{stats.avgApplicationsPerJob || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(analytics?.topDepartments || []).map((dept: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{dept.name}</span>
                      <Badge variant="secondary">{dept.count} jobs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(analytics?.topLocations || []).map((loc: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-gray-600">{loc.name}</span>
                      <Badge variant="secondary">{loc.count} jobs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {(analytics?.recentActivity || []).slice(0, 5).map((activity: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-gray-600">
                      <Activity className="h-4 w-4 text-brand-600" />
                      <span className="truncate">{activity.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>User Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="flex items-center"><Users className="h-5 w-5 mr-2 text-blue-600" />Job Seekers</span>
                    <span className="font-semibold text-lg">{stats.jobSeekers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="flex items-center"><Briefcase className="h-5 w-5 mr-2 text-green-600" />Employers</span>
                    <span className="font-semibold text-lg">{stats.employers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="flex items-center"><Calendar className="h-5 w-5 mr-2 text-orange-600" />Consultation Clients</span>
                    <span className="font-semibold text-lg">{stats.clients || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-medium">+{stats.newUsersThisMonth || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">This Week</span>
                      <span className="font-medium">+{stats.newUsersThisWeek || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Today</span>
                      <span className="font-medium">+{stats.newUsersToday || 0}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full" style={{ width: '20%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Job Status</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active</span>
                    <Badge className="bg-green-100 text-green-800">{stats.activeJobs || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats.pendingJobs || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Closed</span>
                    <Badge variant="secondary">{stats.closedJobs || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Application Stats</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Applications</span>
                    <span className="font-semibold">{stats.totalApplications || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Review</span>
                    <span className="font-semibold">{stats.pendingApplications || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shortlisted</span>
                    <span className="font-semibold">{stats.shortlistedApplications || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hired</span>
                    <span className="font-semibold text-green-600">{stats.hiredCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Job Views</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center"><Eye className="h-4 w-4 mr-1" />Total Views</span>
                    <span className="font-semibold">{stats.totalJobViews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center"><MousePointer className="h-4 w-4 mr-1" />Avg. Views/Job</span>
                    <span className="font-semibold">{stats.avgViewsPerJob || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Revenue Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Job Postings</span>
                    <span className="font-semibold">${(stats.revenueJobPostings || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Featured Listings</span>
                    <span className="font-semibold">${(stats.revenueFeatured || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Subscriptions</span>
                    <span className="font-semibold">${(stats.revenueSubscriptions || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Consultations</span>
                    <span className="font-semibold">${(stats.revenueConsultations || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-brand-50 rounded-lg border-2 border-brand-200">
                    <span className="font-medium text-brand-900">Total Revenue</span>
                    <span className="font-bold text-xl text-brand-700">${(stats.totalRevenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Paystack</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.paystackTransactions || 0}</span>
                      <span className="text-sm text-gray-500">transactions</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">USDT</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.usdtTransactions || 0}</span>
                      <span className="text-sm text-gray-500">transactions</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bank Transfer</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{stats.bankTransactions || 0}</span>
                      <span className="text-sm text-gray-500">transactions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ title, value, change, icon, color }: { title: string; value: string | number; change: number; icon: React.ReactNode; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
