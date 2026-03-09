import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Briefcase,
  Users,
  BookOpen,
  Award,
  Search,
  MapPin,
  Building2,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '../lib/axios';
import type { Job, Testimonial } from '../types';

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCandidates: 0,
    totalEmployers: 0,
    successRate: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, testimonialsRes, statsRes] = await Promise.all([
        api.get('/jobs/featured?limit=6'),
        api.get('/testimonials/featured?limit=3'),
        api.get('/jobs/stats'),
      ]);

      setFeaturedJobs(jobsRes.data.data);
      setTestimonials(testimonialsRes.data.data);
      setStats({
        totalJobs: statsRes.data.data.totalJobs || 0,
        totalCandidates: 1500,
        totalEmployers: 300,
        successRate: 85,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const departments = [
    { name: 'Front Office', icon: '👋', count: 120 },
    { name: 'Housekeeping', icon: '🧹', count: 95 },
    { name: 'Kitchen', icon: '👨‍🍳', count: 150 },
    { name: 'Food & Beverage', icon: '🍽️', count: 110 },
    { name: 'Management', icon: '💼', count: 45 },
    { name: 'Maintenance', icon: '🔧', count: 60 },
  ];

  const features = [
    {
      icon: Search,
      title: 'Find Your Dream Job',
      description: 'Browse thousands of hospitality jobs from top hotels and restaurants worldwide.',
    },
    {
      icon: Award,
      title: 'Get Certified',
      description: 'Take our professional certification interviews to stand out to employers.',
    },
    {
      icon: BookOpen,
      title: 'Learn & Grow',
      description: 'Access free and premium training resources to advance your career.',
    },
    {
      icon: Users,
      title: 'Connect with Employers',
      description: 'Direct access to verified employers looking for talented professionals.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              #1 Hospitality Career Platform in Nigeria
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Your Dream Job in{' '}
              <span className="text-yellow-300">Hospitality</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Connect with top hotels, restaurants, and resorts. Get certified, access premium resources, and land your perfect role.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/jobs">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                  <Search className="h-5 w-5 mr-2" />
                  Find Jobs
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8"
                >
                  <Briefcase className="h-5 w-5 mr-2" />
                  Post a Job
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {[
                { value: stats.totalJobs + '+', label: 'Active Jobs' },
                { value: stats.totalCandidates + '+', label: 'Candidates' },
                { value: stats.totalEmployers + '+', label: 'Employers' },
                { value: stats.successRate + '%', label: 'Success Rate' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-yellow-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-blue-600">Hospitality Hire Hub</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to succeed in your hospitality career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Browse by <span className="text-blue-600">Department</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find opportunities in your area of expertise
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {departments.map((dept, index) => (
              <Link
                key={index}
                to={`/jobs?department=${dept.name.toLowerCase().replace(' ', '_')}`}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {dept.icon}
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{dept.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{dept.count} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Featured <span className="text-blue-600">Jobs</span>
              </h2>
              <p className="text-gray-600">Handpicked opportunities from top employers</p>
            </div>
            <Link to="/jobs">
              <Button variant="outline" className="hidden sm:flex items-center gap-2">
                View All Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Card
                key={job._id}
                className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.companyName}</p>
                      </div>
                    </div>
                    {job.isUrgent && (
                      <Badge className="bg-red-100 text-red-700">Urgent</Badge>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {job.location.city}, {job.location.country}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      {job.jobType.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {job.salary?.min && (
                      <span className="text-blue-600 font-semibold">
                        {job.salary.currency} {job.salary.min.toLocaleString()}
                        {job.salary.max && ` - ${job.salary.max.toLocaleString()}`}
                      </span>
                    )}
                    <Link to={`/jobs/${job._id}`}>
                      <Button size="sm">Apply Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/jobs">
              <Button variant="outline">View All Jobs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Profile',
                description: 'Sign up and build your professional profile with your skills and experience.',
              },
              {
                step: '02',
                title: 'Get Certified',
                description: 'Take our certification interview to prove your expertise.',
              },
              {
                step: '03',
                title: 'Browse Jobs',
                description: 'Explore thousands of opportunities from verified employers.',
              },
              {
                step: '04',
                title: 'Get Hired',
                description: 'Apply to jobs and connect directly with employers.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-blue-200 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success <span className="text-blue-600">Stories</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from professionals who found their dream jobs through us
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial._id} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    {testimonial.photo?.url ? (
                      <img
                        src={testimonial.photo.url}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {testimonial.name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">
                        {testimonial.role}
                        {testimonial.company && ` at ${testimonial.company}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Your Hospitality Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs through Hospitality Hire Hub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8">
                Create Free Account
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
