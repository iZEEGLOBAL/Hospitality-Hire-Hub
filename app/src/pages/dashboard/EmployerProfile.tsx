import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Users, 
  Calendar,
  Upload,
  Save,
  Edit3,
  CheckCircle,
  Mail,
  Phone,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

interface EmployerProfile {
  companyName: string;
  companySize: string;
  industry: string;
  website: string;
  description: string;
  location: string;
  address: string;
  logo: string;
  coverImage: string;
  socialMedia: {
    linkedin: string;
    facebook: string;
    twitter: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  verificationStatus: string;
  createdAt: string;
}

export default function EmployerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['employerProfile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data.data.user;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<EmployerProfile>) => {
      const response = await api.patch('/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employerProfile'] });
      setIsEditing(false);
      toast.success('Your company profile has been updated successfully.', { title: 'Profile updated' });
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.', { title: 'Error' });
    },
  });

  const [formData, setFormData] = useState<Partial<EmployerProfile>>({});

  const handleEdit = () => {
    setFormData({
      companyName: profile?.employerProfile?.companyName,
      companySize: profile?.employerProfile?.companySize,
      industry: profile?.employerProfile?.industry,
      website: profile?.employerProfile?.website,
      description: profile?.employerProfile?.description,
      location: profile?.employerProfile?.location,
      address: profile?.employerProfile?.address,
      socialMedia: profile?.employerProfile?.socialMedia,
      contactPerson: profile?.employerProfile?.contactPerson,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: {
        name: '',
        email: '',
        phone: '',
        position: '',
        ...prev.contactPerson,
        [field]: value,
      },
    }));
  };

  const handleSocialChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        linkedin: '',
        facebook: '',
        twitter: '',
        ...prev.socialMedia,
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const employerProfile = profile?.employerProfile;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your company information and public profile
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-r from-brand-600 to-brand-800 rounded-lg overflow-hidden">
        {employerProfile?.coverImage ? (
          <img
            src={employerProfile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Building2 className="h-20 w-20 text-white/30" />
          </div>
        )}
        {isEditing && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4"
          >
            <Upload className="h-4 w-4 mr-2" />
            Change Cover
          </Button>
        )}
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Company Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center mx-auto lg:mx-0">
                  {employerProfile?.logo ? (
                    <img
                      src={employerProfile.logo}
                      alt="Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-0 left-24"
                  >
                    <Upload className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      value={formData.companyName || ''}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <Input
                      value={formData.industry || ''}
                      onChange={(e) => handleChange('industry', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Company Size</Label>
                    <Input
                      value={formData.companySize || ''}
                      onChange={(e) => handleChange('companySize', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900">
                    {employerProfile?.companyName || 'Company Name'}
                  </h2>
                  <p className="text-gray-600">{employerProfile?.industry}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {employerProfile?.companySize || 'Not specified'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {employerProfile?.location || 'Not specified'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      {employerProfile?.website ? (
                        <a 
                          href={employerProfile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline"
                        >
                          {employerProfile.website}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member since {new Date(profile?.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Badge 
                      variant={employerProfile?.verificationStatus === 'verified' ? 'default' : 'secondary'}
                      className="flex items-center w-fit"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {employerProfile?.verificationStatus === 'verified' 
                        ? 'Verified Employer' 
                        : 'Verification Pending'}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Person */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Person</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.contactPerson?.name || ''}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input
                      value={formData.contactPerson?.position || ''}
                      onChange={(e) => handleContactChange('position', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.contactPerson?.email || ''}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.contactPerson?.phone || ''}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-brand-600 font-semibold">
                        {employerProfile?.contactPerson?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{employerProfile?.contactPerson?.name || 'Not specified'}</p>
                      <p className="text-sm text-gray-600">{employerProfile?.contactPerson?.position}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {employerProfile?.contactPerson?.email || 'Not specified'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {employerProfile?.contactPerson?.phone || 'Not specified'}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="about" className="space-y-4">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About Company</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={8}
                      placeholder="Describe your company, mission, values, and culture..."
                    />
                  ) : (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {employerProfile?.description || 'No company description provided.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label className="flex items-center">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Label>
                        <Input
                          value={formData.socialMedia?.linkedin || ''}
                          onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/company/..."
                        />
                      </div>
                      <div>
                        <Label>Facebook</Label>
                        <Input
                          value={formData.socialMedia?.facebook || ''}
                          onChange={(e) => handleSocialChange('facebook', e.target.value)}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div>
                        <Label>Twitter</Label>
                        <Input
                          value={formData.socialMedia?.twitter || ''}
                          onChange={(e) => handleSocialChange('twitter', e.target.value)}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {employerProfile?.socialMedia?.linkedin && (
                        <a
                          href={employerProfile.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-brand-600 hover:underline"
                        >
                          <Linkedin className="h-5 w-5 mr-2" />
                          LinkedIn Profile
                        </a>
                      )}
                      {employerProfile?.socialMedia?.facebook && (
                        <a
                          href={employerProfile.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-brand-600 hover:underline"
                        >
                          Facebook Page
                        </a>
                      )}
                      {employerProfile?.socialMedia?.twitter && (
                        <a
                          href={employerProfile.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-brand-600 hover:underline"
                        >
                          Twitter Profile
                        </a>
                      )}
                      {!employerProfile?.socialMedia?.linkedin && 
                       !employerProfile?.socialMedia?.facebook && 
                       !employerProfile?.socialMedia?.twitter && (
                        <p className="text-gray-600">No social media links provided.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Company Address</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={formData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      rows={4}
                      placeholder="Full company address..."
                    />
                  ) : (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                      <p className="text-gray-600">
                        {employerProfile?.address || 'No address provided.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
