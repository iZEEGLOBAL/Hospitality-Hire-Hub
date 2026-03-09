import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Heart,
  Award,
  TrendingUp,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/axios';

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    profileCompletion: 0,
    certificationStatus: 'none',
    applicationsCount: 0,
    interviewsCount: 0,
    savedJobsCount: 0,
    coursesCount: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/jobseeker/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const quickLinks = [
    { path: '/dashboard/profile', label: 'Complete Profile', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
    { path: '/dashboard/interview', label: 'Get Certified', icon: Award, color: 'bg-purple-100 text-purple-600' },
    { path: '/jobs', label: 'Browse Jobs', icon: Briefcase, color: 'bg-green-100 text-green-600' },
    { path: '/dashboard/courses', label: 'Start Learning', icon: BookOpen, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your job search
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.applicationsCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.interviewsCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saved Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.savedJobsCount}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.coursesCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion & Certification */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Complete your profile to increase visibility</span>
                <span className="font-medium">{stats.profileCompletion}%</span>
              </div>
              <Progress value={stats.profileCompletion} className="h-2" />
              {stats.profileCompletion < 100 && (
                <Link to="/dashboard/profile">
                  <Button variant="outline" size="sm" className="w-full">
                    Complete Profile
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stats.certificationStatus === 'passed'
                  ? 'bg-green-100'
                  : 'bg-gray-100'
              }`}>
                <Award className={`h-6 w-6 ${
                  stats.certificationStatus === 'passed'
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {stats.certificationStatus === 'passed'
                    ? 'Certified Professional'
                    : stats.certificationStatus === 'in_progress'
                    ? 'Certification In Progress'
                    : 'Not Certified'}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.certificationStatus === 'passed'
                    ? 'Your certification is active and visible to employers'
                    : 'Get certified to stand out to employers'}
                </p>
              </div>
              {stats.certificationStatus !== 'passed' && (
                <Link to="/dashboard/interview">
                  <Button size="sm">Start</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} to={link.path}>
                  <div className="flex items-center gap-3 p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-900">{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
