import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
  };
  applicant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    jobSeekerProfile: {
      photo: string;
      headline: string;
      experience: string;
      education: string;
      skills: string[];
      cv: string;
    };
  };
  coverLetter: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  notes: string;
}

export default function EmployerApplications() {
  const { jobId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications', jobId],
    queryFn: async () => {
      const url = jobId ? `/jobs/${jobId}/applications` : '/jobs/applications/all';
      const response = await api.get(url);
      return response.data.data.applications;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const response = await api.patch(`/applications/${applicationId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application status has been updated.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status. Please try again.', { title: 'Error' });
    },
  });

  const filteredApplications = applications?.filter((app: Application) =>
    `${app.applicant.firstName} ${app.applicant.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center w-fit"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'reviewing':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center w-fit"><Eye className="h-3 w-3 mr-1" />Reviewing</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-100 text-green-800 flex items-center w-fit"><Star className="h-3 w-3 mr-1" />Shortlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 flex items-center w-fit"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'hired':
        return <Badge className="bg-brand-100 text-brand-800 flex items-center w-fit"><CheckCircle className="h-3 w-3 mr-1" />Hired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getApplicationsByStatus = (status: string) => {
    if (status === 'all') return filteredApplications;
    return filteredApplications?.filter((app: Application) => app.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/employer/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
        <p className="text-gray-600 mt-1">
          Review and manage applications from candidates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {['all', 'pending', 'reviewing', 'shortlisted', 'rejected'].map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 capitalize">{status}</p>
              <p className="text-2xl font-bold">
                {getApplicationsByStatus(status)?.length || 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Applications Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="reviewing">Reviewing</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'reviewing', 'shortlisted', 'hired', 'rejected'].map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading applications...</p>
              </div>
            ) : getApplicationsByStatus(status)?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications</h3>
                  <p className="text-gray-600">
                    {status === 'all' ? 'No applications received yet' : `No ${status} applications`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getApplicationsByStatus(status)?.map((application: Application) => (
                  <Card key={application._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <Avatar className="h-16 w-16">
                          {application.applicant.jobSeekerProfile?.photo ? (
                            <img 
                              src={application.applicant.jobSeekerProfile.photo} 
                              alt={`${application.applicant.firstName} ${application.applicant.lastName}`}
                            />
                          ) : (
                            <AvatarFallback className="bg-brand-100 text-brand-600 text-lg">
                              {application.applicant.firstName[0]}{application.applicant.lastName[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {application.applicant.firstName} {application.applicant.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {application.applicant.jobSeekerProfile?.headline || 'No headline'}
                              </p>
                              <p className="text-sm text-brand-600 mt-1">
                                Applied for: {application.job.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(application.status)}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {application.applicant.location || 'Not specified'}
                            </span>
                            <span className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {application.applicant.jobSeekerProfile?.experience || 'Not specified'}
                            </span>
                            <span className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-1" />
                              {application.applicant.jobSeekerProfile?.education || 'Not specified'}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                          </div>

                          {application.applicant.jobSeekerProfile?.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {application.applicant.jobSeekerProfile.skills.slice(0, 5).map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                              ))}
                              {application.applicant.jobSeekerProfile.skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{application.applicant.jobSeekerProfile.skills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex lg:flex-col gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Application Details</DialogTitle>
                              </DialogHeader>
                              
                              {selectedApplication && (
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarFallback className="bg-brand-100 text-brand-600 text-lg">
                                        {selectedApplication.applicant.firstName[0]}{selectedApplication.applicant.lastName[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="font-semibold text-lg">
                                        {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}
                                      </h3>
                                      <p className="text-gray-600">{selectedApplication.applicant.jobSeekerProfile?.headline}</p>
                                      <p className="text-sm text-brand-600">Applied for: {selectedApplication.job.title}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center">
                                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                      {selectedApplication.applicant.email}
                                    </div>
                                    <div className="flex items-center">
                                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                      {selectedApplication.applicant.phone || 'Not provided'}
                                    </div>
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                      {selectedApplication.applicant.location || 'Not specified'}
                                    </div>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                      Applied {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                                    </div>
                                  </div>

                                  {selectedApplication.coverLetter && (
                                    <div>
                                      <h4 className="font-medium mb-2">Cover Letter</h4>
                                      <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                                        {selectedApplication.coverLetter}
                                      </p>
                                    </div>
                                  )}

                                  {selectedApplication.applicant.jobSeekerProfile?.skills?.length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2">Skills</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {selectedApplication.applicant.jobSeekerProfile.skills.map((skill, i) => (
                                          <Badge key={i} variant="secondary">{skill}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex gap-2">
                                    {selectedApplication.applicant.jobSeekerProfile?.cv && (
                                      <Button variant="outline" asChild>
                                        <a href={selectedApplication.applicant.jobSeekerProfile.cv} target="_blank" rel="noopener noreferrer">
                                          <Download className="h-4 w-4 mr-2" />
                                          Download CV
                                        </a>
                                      </Button>
                                    )}
                                    <Button variant="outline">
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Message
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm">Update Status</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => statusMutation.mutate({ applicationId: application._id, status: 'reviewing' })}>
                                <Eye className="h-4 w-4 mr-2" />
                                Mark as Reviewing
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => statusMutation.mutate({ applicationId: application._id, status: 'shortlisted' })}>
                                <Star className="h-4 w-4 mr-2" />
                                Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => statusMutation.mutate({ applicationId: application._id, status: 'hired' })}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Hire
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => statusMutation.mutate({ applicationId: application._id, status: 'rejected' })}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
