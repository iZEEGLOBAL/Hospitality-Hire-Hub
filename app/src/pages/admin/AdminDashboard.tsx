import { useEffect, useState } from 'react';
import { Users, Briefcase, CreditCard, Calendar, MessageSquare, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '../../lib/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: { total: 0, jobSeekers: 0, employers: 0 },
    jobs: { total: 0, active: 0 },
    applications: { total: 0, pending: 0 },
    payments: { total: 0, revenue: 0 },
    consultations: { total: 0, pending: 0 },
    certifications: { certifiedCandidates: 0 },
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of platform performance and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                <p className="text-sm text-gray-400">
                  {stats.users.jobSeekers} job seekers, {stats.users.employers} employers
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.jobs.active}</p>
                <p className="text-sm text-gray-400">of {stats.jobs.total} total jobs</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{stats.payments.revenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">from {stats.payments.total} payments</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.applications.pending}</p>
                <p className="text-sm text-gray-400">of {stats.applications.total} total</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Consultations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.consultations.pending}</p>
                <p className="text-sm text-gray-400">pending requests</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Certified Candidates</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.certifications.certifiedCandidates}
                </p>
                <p className="text-sm text-gray-400">industry certified</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Activity feed will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
}
