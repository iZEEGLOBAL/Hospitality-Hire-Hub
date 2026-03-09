import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Building2,
  MapPin,
  Briefcase,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  MoreHorizontal,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: 'active' | 'pending' | 'closed' | 'rejected';
  department: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  applicantsCount: number;
  views: number;
  postedBy: {
    firstName: string;
    lastName: string;
    employerProfile: {
      companyName: string;
    };
  };
  postedAt: string;
  isUrgent: boolean;
  isFeatured: boolean;
}

export default function AdminJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: async () => {
      const response = await api.get('/admin/jobs');
      return response.data.data.jobs;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const response = await api.patch(`/admin/jobs/${jobId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      toast.success('Job status has been updated.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status.', { title: 'Error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.delete(`/admin/jobs/${jobId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobs'] });
      toast.success('Job has been deleted.', { title: 'Job deleted' });
    },
    onError: () => {
      toast.error('Failed to delete job.', { title: 'Error' });
    },
  });

  const filteredJobs = jobs?.filter((job: Job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Calendar className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'closed':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getJobsByStatus = (status: string) => {
    if (status === 'all') return filteredJobs;
    return filteredJobs?.filter((job: Job) => job.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
        <p className="text-gray-600 mt-1">
          Manage all job listings on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold">{jobs?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold">{jobs?.filter((j: Job) => j.status === 'active').length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold">{jobs?.filter((j: Job) => j.status === 'pending').length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-2xl font-bold">
              {jobs?.reduce((acc: number, j: Job) => acc + j.views, 0).toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs by title, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Jobs Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {['all', 'active', 'pending', 'closed', 'rejected'].map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            ) : getJobsByStatus(status)?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getJobsByStatus(status)?.map((job: Job) => (
                  <Card key={job._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="w-14 h-14 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-7 w-7 text-brand-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            {job.isUrgent && <Badge className="bg-red-100 text-red-800">Urgent</Badge>}
                            {job.isFeatured && <Badge className="bg-purple-100 text-purple-800">Featured</Badge>}
                            {getStatusBadge(job.status)}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            <Building2 className="h-4 w-4 inline mr-1" />
                            {job.company}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {job.department}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {job.applicantsCount} applicants
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {job.views} views
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(job.postedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Job Details</DialogTitle>
                              </DialogHeader>
                              {selectedJob && (
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-xl font-semibold">{selectedJob.title}</h3>
                                    <p className="text-gray-600">{selectedJob.company}</p>
                                    <div className="flex gap-2 mt-2">
                                      {getStatusBadge(selectedJob.status)}
                                      {selectedJob.isUrgent && <Badge className="bg-red-100 text-red-800">Urgent</Badge>}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-500">Location:</span> {selectedJob.location}</div>
                                    <div><span className="text-gray-500">Department:</span> {selectedJob.department}</div>
                                    <div><span className="text-gray-500">Type:</span> {selectedJob.type}</div>
                                    <div><span className="text-gray-500">Salary:</span> {selectedJob.salary.currency} {selectedJob.salary.min.toLocaleString()} - {selectedJob.salary.max.toLocaleString()}</div>
                                    <div><span className="text-gray-500">Applicants:</span> {selectedJob.applicantsCount}</div>
                                    <div><span className="text-gray-500">Views:</span> {selectedJob.views}</div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {job.status === 'pending' && (
                                <DropdownMenuItem 
                                  onClick={() => statusMutation.mutate({ jobId: job._id, status: 'active' })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {job.status === 'pending' && (
                                <DropdownMenuItem 
                                  onClick={() => statusMutation.mutate({ jobId: job._id, status: 'rejected' })}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              )}
                              {job.status === 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => statusMutation.mutate({ jobId: job._id, status: 'closed' })}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Close
                                </DropdownMenuItem>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Job?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{job.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(job._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
