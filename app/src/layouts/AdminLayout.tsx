import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Calendar,
  BookOpen,
  MessageSquare,
  Image,
  Star,
  HelpCircle,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const isActive = (path: string) => location.pathname === path;

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/consultations', label: 'Consultations', icon: Calendar },
    { path: '/admin/resources', label: 'Resources', icon: BookOpen },
    { path: '/admin/community', label: 'Community', icon: MessageSquare },
    { path: '/admin/gallery', label: 'Gallery', icon: Image },
    { path: '/admin/testimonials', label: 'Testimonials', icon: Star },
    { path: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">Admin</span>
                <span className="text-xs text-slate-400 block -mt-1">Panel</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-400 truncate">Administrator</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
            <Link to="/">
              <Button variant="ghost" size="sm">
                View Site
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
