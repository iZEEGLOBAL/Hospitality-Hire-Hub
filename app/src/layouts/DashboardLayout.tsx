import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  BookOpen,
  MessageSquare,
  Heart,
  Building2,
  Users,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DashboardLayoutProps {
  role: 'jobseeker' | 'employer';
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path: string) => location.pathname === path;

  const jobSeekerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/profile', label: 'My Profile', icon: User },
    { path: '/dashboard/applications', label: 'My Applications', icon: FileText },
    { path: '/dashboard/saved-jobs', label: 'Saved Jobs', icon: Heart },
    { path: '/dashboard/interview', label: 'Certification', icon: MessageSquare },
    { path: '/dashboard/courses', label: 'Training Courses', icon: BookOpen },
    { path: '/dashboard/resources', label: 'Resources', icon: Briefcase },
  ];

  const employerLinks = [
    { path: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employer/profile', label: 'Company Profile', icon: Building2 },
    { path: '/employer/jobs', label: 'My Jobs', icon: Briefcase },
    { path: '/employer/jobs/post', label: 'Post a Job', icon: PlusCircle },
    { path: '/employer/applications', label: 'Applications', icon: FileText },
    { path: '/employer/candidates', label: 'Find Candidates', icon: Users },
  ];

  const links = role === 'employer' ? employerLinks : jobSeekerLinks;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HHH
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <div className="flex items-center gap-4">
            {/* Subscription Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.subscription?.plan === 'pro'
                  ? 'bg-purple-100 text-purple-700'
                  : user.subscription?.plan === 'business'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {user.subscription?.plan?.toUpperCase() || 'FREE'}
            </div>

            <Link to="/">
              <Button variant="ghost" size="sm">
                Back to Site
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
