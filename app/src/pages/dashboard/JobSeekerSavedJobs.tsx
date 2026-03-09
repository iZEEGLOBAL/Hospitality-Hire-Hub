import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Bookmark,
  Trash2,
  ExternalLink,
  Building2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Link } from 'react-router-dom';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  department: string;
  isUrgent: boolean;
  postedAt: string;
  savedAt: string;
}

export default function JobSeekerSavedJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedJobs, isLoading } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: async () => {
      const response = await api.get('/jobs/saved');
      return response.data.data.jobs;
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.delete(`/jobs/${jobId}/save`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      toast.success('Job has been removed from your saved list', { title: 'Job removed' });
    },
    onError: () => {
      toast.error('Failed to remove job. Please try again.', { title: 'Error' });
    },
  });

  const filteredJobs = savedJobs?.filter((job: Job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSalary = (salary: Job['salary']) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="text-gray-600 mt-1">
            Manage your saved job listings and apply when ready
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/jobs">
            <ExternalLink className="h-4 w-4 mr-2" />
            Browse More Jobs
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search saved jobs by title, company, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Saved Jobs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading saved jobs...</p>
        </div>
      ) : filteredJobs?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
            <p className="text-gray-600 mb-4">
              Save jobs you're interested in to review them later
            </p>
            <Button asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs?.map((job: Job) => (
            <Card key={job._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Company Logo Placeholder */}
                  <div className="w-16 h-16 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-brand-600" />
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      <div className="flex gap-2">
                        {job.isUrgent && (
                          <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                        )}
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
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
                        {formatSalary(job.salary)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Saved {new Date(job.savedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mt-3 text-gray-600 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <Button asChild className="flex-1 lg:w-full">
                      <Link to={`/jobs/${job._id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="flex-1 lg:w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Saved Job?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{job.title}" from your saved jobs? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => unsaveMutation.mutate(job._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
