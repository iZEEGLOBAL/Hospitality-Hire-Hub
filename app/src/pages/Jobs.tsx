import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '../lib/axios';
import type { Job } from '../types';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    jobType: '',
    experienceLevel: '',
    location: '',
  });
  const [departments, setDepartments] = useState<{ value: string; label: string }[]>([]);
  const [jobTypes, setJobTypes] = useState<{ value: string; label: string }[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    fetchFilters();
    fetchJobs();
  }, []);

  const fetchFilters = async () => {
    try {
      const [deptRes, typeRes, expRes] = await Promise.all([
        api.get('/jobs/departments'),
        api.get('/jobs/types'),
        api.get('/jobs/experience-levels'),
      ]);
      setDepartments(deptRes.data.data);
      setJobTypes(typeRes.data.data);
      setExperienceLevels(expRes.data.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/jobs?${params.toString()}`);
      setJobs(response.data.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      jobType: '',
      experienceLevel: '',
      location: '',
    });
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Find Your Dream Job</h1>
          <p className="text-blue-100">Browse thousands of hospitality opportunities</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs, companies, or keywords..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select
              value={filters.department}
              onValueChange={(value) => setFilters({ ...filters, department: value })}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.jobType}
              onValueChange={(value) => setFilters({ ...filters, jobType: value })}
            >
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.experienceLevel}
              onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {(filters.search || filters.department || filters.jobType || filters.experienceLevel) && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job._id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.companyName}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.companyName}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location.city}, {job.location.country}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {job.jobType.replace('_', ' ')}
                            </span>
                            <Badge variant="secondary">{job.department.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {job.salary?.min && (
                          <span className="text-blue-600 font-semibold">
                            {job.salary.currency} {job.salary.min.toLocaleString()}
                            {job.salary.max && ` - ${job.salary.max.toLocaleString()}`}
                          </span>
                        )}
                        <Link to={`/jobs/${job._id}`}>
                          <Button>View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
