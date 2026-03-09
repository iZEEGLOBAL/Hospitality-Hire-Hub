import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Briefcase,
  GraduationCap,
  Star,
  Mail,
  Download,
  Eye,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/axios';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  jobSeekerProfile: {
    photo: string;
    headline: string;
    experience: string;
    education: string;
    skills: string[];
    department: string;
    availability: string;
    expectedSalary: {
      min: number;
      max: number;
      currency: string;
    };
    certifications: string[];
    languages: string[];
    cv: string;
    bio: string;
  };
  isCertified: boolean;
  rating: number;
}

export default function EmployerCandidates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    experience: '',
    availability: '',
    certifiedOnly: false,
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', searchQuery, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filters.department) params.append('department', filters.department);
      if (filters.experience) params.append('experience', filters.experience);
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.certifiedOnly) params.append('certified', 'true');
      
      const response = await api.get(`/users/candidates?${params.toString()}`);
      return response.data.data.candidates;
    },
  });

  const departments = [
    { value: '', label: 'All Departments' },
    { value: 'front_office', label: 'Front Office' },
    { value: 'housekeeping', label: 'Housekeeping' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'food_beverage', label: 'Food & Beverage' },
    { value: 'management', label: 'Management' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'spa_wellness', label: 'Spa & Wellness' },
  ];

  const experienceLevels = [
    { value: '', label: 'All Experience' },
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5-10 years)' },
    { value: 'executive', label: 'Executive (10+ years)' },
  ];

  const availabilityOptions = [
    { value: '', label: 'All Availability' },
    { value: 'immediate', label: 'Immediate' },
    { value: '2_weeks', label: '2 Weeks Notice' },
    { value: '1_month', label: '1 Month Notice' },
    { value: 'negotiable', label: 'Negotiable' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Candidates</h1>
        <p className="text-gray-600 mt-1">
          Search and discover qualified hospitality professionals
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, skills, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              >
                {experienceLevels.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>

              <select
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              >
                {availabilityOptions.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 px-3 h-10 border rounded-md">
                <Checkbox
                  id="certified"
                  checked={filters.certifiedOnly}
                  onCheckedChange={(checked) => 
                    setFilters({ ...filters, certifiedOnly: checked as boolean })
                  }
                />
                <Label htmlFor="certified" className="text-sm font-normal cursor-pointer">
                  Certified Only
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
          <p className="mt-4 text-gray-600">Searching candidates...</p>
        </div>
      ) : candidates?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {candidates?.map((candidate: Candidate) => (
            <Card key={candidate._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16">
                    {candidate.jobSeekerProfile?.photo ? (
                      <img 
                        src={candidate.jobSeekerProfile.photo} 
                        alt={`${candidate.firstName} ${candidate.lastName}`}
                      />
                    ) : (
                      <AvatarFallback className="bg-brand-100 text-brand-600 text-lg">
                        {candidate.firstName[0]}{candidate.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {candidate.jobSeekerProfile?.headline || 'Hospitality Professional'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {candidate.isCertified && (
                          <Badge className="bg-brand-100 text-brand-800">
                            <Star className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {candidate.location || 'Not specified'}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {candidate.jobSeekerProfile?.experience || 'Not specified'}
                      </span>
                      <span className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        {candidate.jobSeekerProfile?.education || 'Not specified'}
                      </span>
                    </div>

                    {candidate.jobSeekerProfile?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {candidate.jobSeekerProfile.skills.slice(0, 4).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                        {candidate.jobSeekerProfile.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{candidate.jobSeekerProfile.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedCandidate(candidate)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Candidate Profile</DialogTitle>
                          </DialogHeader>
                          
                          {selectedCandidate && (
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                  <AvatarFallback className="bg-brand-100 text-brand-600 text-2xl">
                                    {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-semibold">
                                    {selectedCandidate.firstName} {selectedCandidate.lastName}
                                  </h3>
                                  <p className="text-gray-600">{selectedCandidate.jobSeekerProfile?.headline}</p>
                                  <div className="flex gap-2 mt-2">
                                    {selectedCandidate.isCertified && (
                                      <Badge className="bg-brand-100 text-brand-800">
                                        <Star className="h-3 w-3 mr-1" />
                                        Certified
                                      </Badge>
                                    )}
                                    <Badge variant="outline">
                                      {selectedCandidate.jobSeekerProfile?.department}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Location:</span>
                                  <p>{selectedCandidate.location || 'Not specified'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Experience:</span>
                                  <p>{selectedCandidate.jobSeekerProfile?.experience || 'Not specified'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Education:</span>
                                  <p>{selectedCandidate.jobSeekerProfile?.education || 'Not specified'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Availability:</span>
                                  <p>{selectedCandidate.jobSeekerProfile?.availability || 'Not specified'}</p>
                                </div>
                              </div>

                              {selectedCandidate.jobSeekerProfile?.bio && (
                                <div>
                                  <h4 className="font-medium mb-2">About</h4>
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                    {selectedCandidate.jobSeekerProfile.bio}
                                  </p>
                                </div>
                              )}

                              {selectedCandidate.jobSeekerProfile?.skills?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Skills</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedCandidate.jobSeekerProfile.skills.map((skill, i) => (
                                      <Badge key={i} variant="secondary">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedCandidate.jobSeekerProfile?.certifications?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Certifications</h4>
                                  <ul className="list-disc list-inside text-sm text-gray-600">
                                    {selectedCandidate.jobSeekerProfile.certifications.map((cert, i) => (
                                      <li key={i}>{cert}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {selectedCandidate.jobSeekerProfile?.languages?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Languages</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedCandidate.jobSeekerProfile.languages.map((lang, i) => (
                                      <Badge key={i} variant="outline">{lang}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2">
                                {selectedCandidate.jobSeekerProfile?.cv && (
                                  <Button variant="outline" asChild>
                                    <a href={selectedCandidate.jobSeekerProfile.cv} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download CV
                                    </a>
                                  </Button>
                                )}
                                <Button variant="outline">
                                  <Bookmark className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                                <Button>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Contact
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4 mr-1" />
                        Save
                      </Button>

                      <Button size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
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
