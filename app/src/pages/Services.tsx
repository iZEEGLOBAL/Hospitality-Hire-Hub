import { CheckCircle2, Briefcase, GraduationCap, Users, MessageSquare, BookOpen, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Services() {
  const services = [
    {
      icon: Briefcase,
      title: 'Job Matching',
      description: 'Our intelligent matching system connects job seekers with relevant opportunities based on skills, experience, and preferences.',
      features: ['AI-powered matching', 'Personalized job alerts', 'Direct employer contact', 'Application tracking'],
      cta: 'Browse Jobs',
      link: '/jobs',
    },
    {
      icon: Award,
      title: 'Certification Program',
      description: 'Stand out to employers with our industry-recognized certification. Test your knowledge and prove your expertise.',
      features: ['Department-specific tests', 'Instant results', 'Digital certificates', 'Employer verification'],
      cta: 'Get Certified',
      link: '/dashboard/interview',
    },
    {
      icon: GraduationCap,
      title: 'Training & Development',
      description: 'Access comprehensive training resources to enhance your skills and advance your hospitality career.',
      features: ['Free SOPs & guides', 'Premium courses', 'Video tutorials', 'Skill assessments'],
      cta: 'Explore Resources',
      link: '/resources',
    },
    {
      icon: Users,
      title: 'Employer Services',
      description: 'Find and hire the best hospitality talent. Post jobs, search certified candidates, and manage applications.',
      features: ['Job posting', 'Candidate search', 'Application management', 'Interview scheduling'],
      cta: 'Post a Job',
      link: '/employer/jobs/post',
    },
    {
      icon: MessageSquare,
      title: 'Consultation',
      description: 'Get expert advice for your hospitality business. Online and in-person consultations available.',
      features: ['Business analysis', 'Staff training advice', 'Operational guidance', 'Growth strategies'],
      cta: 'Book Consultation',
      link: '/consultation',
    },
    {
      icon: BookOpen,
      title: 'Community',
      description: 'Join our community of hospitality professionals. Share experiences, ask questions, and network.',
      features: ['Discussion forums', 'Industry news', 'Networking events', 'Peer support'],
      cta: 'Join Community',
      link: '/community',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive solutions for hospitality professionals and employers
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="border-0 shadow-xl">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="h-7 w-7 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h2>
                    <p className="text-gray-600 mb-6">{service.description}</p>
                    <ul className="space-y-2 mb-8">
                      {service.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to={service.link}>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        {service.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Join thousands of hospitality professionals and employers who trust Hospitality Hire Hub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 px-8">
                Create Free Account
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
