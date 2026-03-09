import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, FileText, TrendingUp, PlusCircle, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/axios';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalJobsPosted: 0,
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/employer/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your job postings and find great candidates
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/employer/jobs/post">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">Post a Job</span>
              </div>
            </Link>
            <Link to="/employer/candidates">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">Find Candidates</span>
              </div>
            </Link>
            <Link to="/employer/applications">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-green-300 hover:bg-green-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">Applications</span>
              </div>
            </Link>
            <Link to="/employer/profile">
              <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-orange-300 hover:bg-orange-50 transition-colors">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">Company Profile</span>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
