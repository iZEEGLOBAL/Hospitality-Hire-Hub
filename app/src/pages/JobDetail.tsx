import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  Building2,
  DollarSign,
  GraduationCap,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import type { Job } from '../types';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const [jobRes, relatedRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/jobs/${id}/related`),
      ]);
      setJob(jobRes.data.data);
      setRelatedJobs(relatedRes.data.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
          <Link to="/jobs">
            <Button variant="link">Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link to="/jobs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.companyName}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{job.title}</h1>
                      <p className="text-lg text-gray-600">{job.companyName}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="secondary">{job.department.replace('_', ' ')}</Badge>
                        {job.isUrgent && <Badge className="bg-red-100 text-red-700">Urgent</Badge>}
                        {job.isFeatured && <Badge className="bg-yellow-100 text-yellow-700">Featured</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>{job.location.city}, {job.location.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <span>{job.jobType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <span>{job.experienceLevel} Level</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span>{job.views} views</span>
                  </div>
                </div>

                {/* Salary */}
                {job.salary?.min && (
                  <div className="flex items-center gap-2 mb-8 p-4 bg-blue-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      {job.salary.currency} {job.salary.min.toLocaleString()}
                      {job.salary.max && ` - ${job.salary.max.toLocaleString()}`}
                      <span className="font-normal text-blue-700"> / {job.salary.period}</span>
                    </span>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">{job.requirements}</p>
                  </div>
                </div>

                {/* Responsibilities */}
                {job.responsibilities && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-600 whitespace-pre-line">{job.responsibilities}</p>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-600 whitespace-pre-line">{job.benefits}</p>
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                {job.requiredSkills?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <div className="flex gap-4">
                  {isAuthenticated && user?.role === 'jobseeker' ? (
                    <Link to={`/dashboard/apply/${job._id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" size="lg">
                        Apply Now
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/login" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600" size="lg">
                        Login to Apply
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">About the Company</h3>
                <div className="flex items-center gap-3 mb-4">
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
                    <p className="font-medium text-gray-900">{job.companyName}</p>
                    <p className="text-sm text-gray-500">Verified Employer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Job Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date Posted</span>
                    <span className="text-gray-900">
                      {new Date(job.publishedAt || job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Expiration Date</span>
                    <span className="text-gray-900">
                      {job.applicationDeadline
                        ? new Date(job.applicationDeadline).toLocaleDateString()
                        : 'Open'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Openings</span>
                    <span className="text-gray-900">{job.openings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Experience</span>
                    <span className="text-gray-900">{job.minExperience}+ years</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Similar Jobs</h3>
                  <div className="space-y-4">
                    {relatedJobs.map((relatedJob) => (
                      <Link key={relatedJob._id} to={`/jobs/${relatedJob._id}`}>
                        <div className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <h4 className="font-medium text-gray-900">{relatedJob.title}</h4>
                          <p className="text-sm text-gray-500">{relatedJob.companyName}</p>
                          <p className="text-sm text-gray-400">{relatedJob.location.city}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
