import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Resources from './pages/Resources';
import Gallery from './pages/Gallery';
import Testimonials from './pages/Testimonials';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Consultation from './pages/Consultation';
import Community from './pages/Community';
import Pricing from './pages/Pricing';
import PaymentVerify from './pages/PaymentVerify';

// Dashboard Pages - Job Seeker
import JobSeekerDashboard from './pages/dashboard/JobSeekerDashboard';
import JobSeekerProfile from './pages/dashboard/JobSeekerProfile';
import JobSeekerApplications from './pages/dashboard/JobSeekerApplications';
import JobSeekerCourses from './pages/dashboard/JobSeekerCourses';
import JobSeekerInterview from './pages/dashboard/JobSeekerInterview';
import JobSeekerResources from './pages/dashboard/JobSeekerResources';
import JobSeekerSavedJobs from './pages/dashboard/JobSeekerSavedJobs';

// Dashboard Pages - Employer
import EmployerDashboard from './pages/dashboard/EmployerDashboard';
import EmployerProfile from './pages/dashboard/EmployerProfile';
import EmployerJobs from './pages/dashboard/EmployerJobs';
import EmployerPostJob from './pages/dashboard/EmployerPostJob';
import EmployerApplications from './pages/dashboard/EmployerApplications';
import EmployerCandidates from './pages/dashboard/EmployerCandidates';

// Dashboard Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminPayments from './pages/admin/AdminPayments';
import AdminConsultations from './pages/admin/AdminConsultations';
import AdminResources from './pages/admin/AdminResources';
import AdminCommunity from './pages/admin/AdminCommunity';
import AdminGallery from './pages/admin/AdminGallery';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/community" element={<Community />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/payment/verify" element={<PaymentVerify />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<MainLayout hideFooter />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Job Seeker Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['jobseeker']} />}>
              <Route element={<DashboardLayout role="jobseeker" />}>
                <Route path="/dashboard" element={<JobSeekerDashboard />} />
                <Route path="/dashboard/profile" element={<JobSeekerProfile />} />
                <Route path="/dashboard/applications" element={<JobSeekerApplications />} />
                <Route path="/dashboard/courses" element={<JobSeekerCourses />} />
                <Route path="/dashboard/interview" element={<JobSeekerInterview />} />
                <Route path="/dashboard/resources" element={<JobSeekerResources />} />
                <Route path="/dashboard/saved-jobs" element={<JobSeekerSavedJobs />} />
              </Route>
            </Route>

            {/* Employer Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
              <Route element={<DashboardLayout role="employer" />}>
                <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                <Route path="/employer/profile" element={<EmployerProfile />} />
                <Route path="/employer/jobs" element={<EmployerJobs />} />
                <Route path="/employer/jobs/post" element={<EmployerPostJob />} />
                <Route path="/employer/applications" element={<EmployerApplications />} />
                <Route path="/employer/candidates" element={<EmployerCandidates />} />
              </Route>
            </Route>

            {/* Admin Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/consultations" element={<AdminConsultations />} />
                <Route path="/admin/resources" element={<AdminResources />} />
                <Route path="/admin/community" element={<AdminCommunity />} />
                <Route path="/admin/gallery" element={<AdminGallery />} />
                <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                <Route path="/admin/faqs" element={<AdminFAQs />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
