import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { Link } from 'react-router-dom';

interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: string;
  department: string;
  experienceLevel: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  benefits: string[];
  skills: string[];
  deadline: string;
  isUrgent: boolean;
}

export default function EmployerPostJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: [],
    responsibilities: [],
    location: '',
    type: 'full-time',
    department: '',
    experienceLevel: 'entry',
    salary: {
      min: 0,
      max: 0,
      currency: 'USD',
      period: 'monthly',
    },
    benefits: [],
    skills: [],
    deadline: '',
    isUrgent: false,
  });

  const postJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await api.post('/jobs', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Your job listing is now live and visible to candidates.', { title: 'Job posted successfully!' });
      navigate('/dashboard/employer/jobs');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Please try again.', { title: 'Error posting job' });
    },
  });

  const addItem = (field: 'requirements' | 'responsibilities' | 'benefits' | 'skills', value: string, setter: (val: string) => void) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setter('');
    }
  };

  const removeItem = (field: 'requirements' | 'responsibilities' | 'benefits' | 'skills', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    postJobMutation.mutate(formData);
  };

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Job title, location, type' },
    { number: 2, title: 'Details', description: 'Description, requirements' },
    { number: 3, title: 'Compensation', description: 'Salary and benefits' },
    { number: 4, title: 'Review', description: 'Preview and publish' },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.location && formData.department;
      case 2:
        return formData.description && formData.requirements.length > 0;
      case 3:
        return formData.salary.min > 0 && formData.salary.max > 0;
      default:
        return true;
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-600 mt-1">
          Create a job listing to attract qualified candidates
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              currentStep === step.number
                ? 'bg-brand-100 text-brand-800'
                : currentStep > step.number
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.number
                  ? 'bg-brand-600 text-white'
                  : currentStep > step.number
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {currentStep > step.number ? <CheckCircle className="h-4 w-4" /> : step.number}
            </div>
            <div>
              <p className="font-medium text-sm">{step.title}</p>
              <p className="text-xs opacity-80">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Hotel Manager"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <select
                    id="department"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    <option value="front_office">Front Office</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="food_beverage">Food & Beverage</option>
                    <option value="management">Management</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="spa_wellness">Spa & Wellness</option>
                    <option value="sales_marketing">Sales & Marketing</option>
                    <option value="finance">Finance</option>
                    <option value="hr">Human Resources</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="type">Job Type *</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Lagos, Nigeria"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <select
                    id="experience"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  >
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (2-5 years)</option>
                    <option value="senior">Senior Level (5-10 years)</option>
                    <option value="executive">Executive (10+ years)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={formData.isUrgent}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, isUrgent: checked as boolean })
                  }
                />
                <Label htmlFor="urgent" className="font-normal">
                  Mark as urgent hiring
                </Label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                />
              </div>

              <div>
                <Label>Requirements *</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a requirement (e.g., 3+ years of experience)"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('requirements', newRequirement, setNewRequirement);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addItem('requirements', newRequirement, setNewRequirement)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {req}
                      <button
                        onClick={() => removeItem('requirements', index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Responsibilities</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a responsibility"
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('responsibilities', newResponsibility, setNewResponsibility);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addItem('responsibilities', newResponsibility, setNewResponsibility)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.responsibilities.map((resp, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {resp}
                      <button
                        onClick={() => removeItem('responsibilities', index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Required Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a skill (e.g., Customer Service)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('skills', newSkill, setNewSkill);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addItem('skills', newSkill, setNewSkill)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {skill}
                      <button
                        onClick={() => removeItem('skills', index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum Salary *</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.salary.min || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      salary: { ...formData.salary, min: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="salaryMax">Maximum Salary *</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    placeholder="e.g., 80000"
                    value={formData.salary.max || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      salary: { ...formData.salary, max: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.salary.currency}
                    onChange={(e) => setFormData({
                      ...formData,
                      salary: { ...formData.salary, currency: e.target.value }
                    })}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="ZAR">ZAR (R)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="period">Salary Period</Label>
                <select
                  id="period"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={formData.salary.period}
                  onChange={(e) => setFormData({
                    ...formData,
                    salary: { ...formData.salary, period: e.target.value }
                  })}
                >
                  <option value="hourly">Per Hour</option>
                  <option value="daily">Per Day</option>
                  <option value="weekly">Per Week</option>
                  <option value="monthly">Per Month</option>
                  <option value="yearly">Per Year</option>
                </select>
              </div>

              <div>
                <Label>Benefits</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add a benefit (e.g., Health Insurance)"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('benefits', newBenefit, setNewBenefit);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addItem('benefits', newBenefit, setNewBenefit)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {benefit}
                      <button
                        onClick={() => removeItem('benefits', index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Job Preview</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{formData.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline">{formData.department}</Badge>
                      <Badge variant="outline">{formData.type}</Badge>
                      {formData.isUrgent && <Badge className="bg-red-100 text-red-800">Urgent</Badge>}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-2">{formData.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <span className="ml-2">{formData.experienceLevel}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Salary:</span>
                      <span className="ml-2">
                        {formData.salary.currency} {formData.salary.min.toLocaleString()} - {formData.salary.max.toLocaleString()} / {formData.salary.period}
                      </span>
                    </div>
                    {formData.deadline && (
                      <div>
                        <span className="text-gray-500">Deadline:</span>
                        <span className="ml-2">{new Date(formData.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h5 className="font-medium mb-2">Description</h5>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.description}</p>
                  </div>

                  {formData.requirements.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Requirements</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {formData.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {formData.benefits.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Benefits</h5>
                      <div className="flex flex-wrap gap-2">
                        {formData.benefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary">{benefit}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Ready to publish?</p>
                  <p className="text-sm text-blue-700">
                    Your job will be visible to all candidates immediately after posting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={postJobMutation.isPending}
          >
            {postJobMutation.isPending ? 'Publishing...' : 'Publish Job'}
          </Button>
        )}
      </div>
    </div>
  );
}
