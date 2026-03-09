export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'jobseeker' | 'employer' | 'consultation_client';
  phone?: string;
  whatsapp?: string;
  photo?: { url: string };
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  subscription: {
    plan: 'free' | 'pro' | 'business';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate?: string;
    endDate?: string;
  };
  isActive: boolean;
  isVerified: boolean;
  jobSeekerProfile?: JobSeekerProfile;
  employerProfile?: EmployerProfile;
  createdAt: string;
}

export interface JobSeekerProfile {
  professionalTitle?: string;
  yearsOfExperience: number;
  currentSalary?: number;
  expectedSalary?: number;
  currency: string;
  bio?: string;
  skills: string[];
  languages: { language: string; proficiency: string }[];
  preferredDepartments: string[];
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  cv?: { url: string; originalName: string };
  passportPhoto?: { url: string };
  availability?: string;
  willingToRelocate: boolean;
  certificationStatus: 'none' | 'in_progress' | 'passed' | 'failed';
  profileCompletion: number;
  isProfilePublic: boolean;
}

export interface WorkExperience {
  companyName: string;
  position: string;
  department: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentJob: boolean;
  responsibilities?: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  documentUrl?: string;
}

export interface EmployerProfile {
  companyName?: string;
  companyType?: string;
  companySize?: string;
  companyWebsite?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyLogo?: { url: string };
  companyDescription?: string;
  industry?: string;
  yearEstablished?: number;
  registrationNumber?: string;
  taxId?: string;
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  isVerified: boolean;
  jobsPosted: number;
  activeJobs: number;
}

export interface Job {
  _id: string;
  title: string;
  slug: string;
  employer: User | string;
  companyName: string;
  companyLogo?: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  benefits?: string;
  department: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  minExperience: number;
  location: {
    country: string;
    state?: string;
    city: string;
    address?: string;
    isRemote: boolean;
  };
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: string;
    isNegotiable: boolean;
  };
  requiredSkills: string[];
  requiredCertifications?: string[];
  openings: number;
  applicationDeadline?: string;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
  isFeatured: boolean;
  isUrgent: boolean;
  views: number;
  applicationsCount: number;
  publishedAt?: string;
  createdAt: string;
}

export interface JobApplication {
  _id: string;
  job: Job;
  jobSeeker: User;
  employer: User | string;
  coverLetter?: string;
  expectedSalary?: {
    amount: number;
    currency: string;
    period: string;
  };
  availability?: string;
  status: string;
  interview?: {
    scheduledAt?: string;
    type?: string;
    location?: string;
    meetingLink?: string;
    notes?: string;
  };
  isViewed: boolean;
  createdAt: string;
}

export interface Resource {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  category: string;
  accessType: 'free' | 'premium';
  file: {
    url: string;
    originalName?: string;
    fileType?: string;
  };
  thumbnail?: { url: string };
  author?: User;
  authorName?: string;
  department?: string;
  difficultyLevel: string;
  estimatedTime?: number;
  status: string;
  downloadCount: number;
  viewCount: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  department: string;
  level: string;
  accessType: 'free' | 'premium';
  thumbnail?: { url: string };
  instructor?: {
    name: string;
    bio?: string;
    photo?: string;
  };
  modules: CourseModule[];
  totalDuration: number;
  totalLessons: number;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  status: string;
  rating: {
    average: number;
    count: number;
  };
  enrollmentsCount: number;
  completionsCount: number;
}

export interface CourseModule {
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration: number;
  resources?: { name: string; url: string; type: string }[];
  isPreview: boolean;
  order: number;
}

export interface Post {
  _id: string;
  author: User;
  authorName: string;
  authorPhoto?: string;
  content: string;
  title?: string;
  type: string;
  category: string;
  tags: string[];
  media?: { type: string; url: string; thumbnail?: string }[];
  likes: { user: string; createdAt: string }[];
  comments: Comment[];
  views: number;
  status: string;
  isPinned: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  authorName: string;
  authorPhoto?: string;
  content: string;
  likes: { user: string; createdAt: string }[];
  replies?: Comment[];
  createdAt: string;
  isEdited: boolean;
}

export interface Consultation {
  _id: string;
  client: User;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  businessName: string;
  businessType: string;
  businessLocation?: {
    country?: string;
    state?: string;
    city?: string;
    address?: string;
  };
  propertyDescription: string;
  type: 'online' | 'physical';
  preferredDate?: string;
  preferredTime?: string;
  status: string;
  scheduledDate?: string;
  scheduledTime?: string;
  meetingDetails?: {
    platform?: string;
    link?: string;
    meetingId?: string;
    password?: string;
  };
  cost?: {
    amount: number;
    currency: string;
    isPaid: boolean;
  };
  createdAt: string;
}

export interface Payment {
  _id: string;
  reference: string;
  user: User;
  type: string;
  paymentFor: {
    plan?: string;
    duration?: string;
  };
  amount: number;
  currency: string;
  method: string;
  status: string;
  paidAt?: string;
  subscription?: {
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  createdAt: string;
}

export interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  image: { url: string };
  category: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
  };
  isFeatured: boolean;
  status: string;
  views: number;
  createdAt: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company?: string;
  photo?: { url: string };
  content: string;
  rating: number;
  category: string;
  isFeatured: boolean;
  status: string;
  createdAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
}

export interface InterviewSession {
  _id: string;
  department: string;
  questions: {
    questionId: string;
    question: string;
    options?: { text: string; isCorrect: boolean }[];
    type: string;
    userAnswer?: string;
    isCorrect?: boolean;
    earnedPoints?: number;
  }[];
  results?: {
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    totalPoints: number;
    earnedPoints: number;
    percentage: number;
    grade: string;
    status: string;
  };
  status: string;
  attemptNumber: number;
  certificationAwarded: boolean;
  certificate?: {
    certificateId: string;
    issuedAt: string;
    expiresAt: string;
  };
  startedAt: string;
  completedAt?: string;
}
