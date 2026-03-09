import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  Users,
  Clock,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
  PauseCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { Link } from 'react-router-dom';

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  status: 'active' | 'paused' | 'closed';
  department: string;
  applicantsCount: number;
  views: number;
  postedAt: string;
  expiresAt: string;
  isUrgent: boolean;
}

export default function EmployerJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['employerJobs'],
    queryFn: async () => {
      const response = await api.get('/jobs/employer/my-jobs');
      return response.data.data.jobs;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      const response = await api.patch(`/jobs/${jobId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
      toast.success('Job status has been updated successfully.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status. Please try again.', { title: 'Error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.delete(`/jobs/${jobId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerJobs'] });
      toast.success('Job has been deleted successfully.', { title: 'Job deleted' });
    },
    onError: () => {
      toast.error('Failed to delete job. Please try again.', { title: 'Error' });
    },
  });

  const filteredJobs = jobs?.filter((job: Job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center w-fit">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center w-fit">
            <PauseCircle className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center w-fit">
            <XCircle className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Listings</h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and track applications
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/employer/jobs/post">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{jobs?.length || 0}</p>
              </div>
              <Briefcase className="h-8 w-8 text-brand-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {jobs?.filter((j: Job) => j.status === 'active').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applicants</p>
                <p className="text-2xl font-bold">
                  {jobs?.reduce((acc: number, j: Job) => acc + j.applicantsCount, 0) || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">
                  {jobs?.reduce((acc: number, j: Job) => acc + j.views, 0) || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search jobs by title, department, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Jobs Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>

        {['all', 'active', 'paused', 'closed'].map((status) => (
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
                  <p className="text-gray-600 mb-4">
                    {status === 'all' 
                      ? 'Start by posting your first job listing' 
                      : `No ${status} jobs at the moment`}
                  </p>
                  {status === 'all' && (
                    <Button asChild>
                      <Link to="/dashboard/employer/jobs/post">
                        <Plus className="h-4 w-4 mr-2" />
                        Post New Job
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getJobsByStatus(status)?.map((job: Job) => (
                  <Card key={job._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            {job.isUrgent && (
                              <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                            )}
                            {getStatusBadge(job.status)}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {job.department}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {job.type}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center text-blue-600">
                              <Users className="h-4 w-4 mr-1" />
                              {job.applicantsCount} applicants
                            </span>
                            <span className="flex items-center text-gray-600">
                              <Eye className="h-4 w-4 mr-1" />
                              {job.views} views
                            </span>
                            <span className="text-gray-500">
                              Posted {new Date(job.postedAt).toLocaleDateString()}
                            </span>
                            <span className="text-gray-500">
                              Expires {new Date(job.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/dashboard/employer/jobs/${job._id}/applicants`}>
                              <Users className="h-4 w-4 mr-1" />
                              Applicants
                            </Link>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/jobs/${job._id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Job
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/dashboard/employer/jobs/${job._id}/edit`}>
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              {job.status === 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => statusMutation.mutate({ jobId: job._id, status: 'paused' })}
                                >
                                  <PauseCircle className="h-4 w-4 mr-2" />
                                  Pause
                                </DropdownMenuItem>
                              )}
                              {job.status === 'paused' && (
                                <DropdownMenuItem 
                                  onClick={() => statusMutation.mutate({ jobId: job._id, status: 'active' })}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {job.status !== 'closed' && (
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
