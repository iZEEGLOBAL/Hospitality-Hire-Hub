import { Target, Eye, Heart, Users, Award, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  const values = [
    {
      icon: Heart,
      title: 'Passion for Hospitality',
      description: 'We are driven by a genuine love for the hospitality industry and a desire to see it thrive.',
    },
    {
      icon: Users,
      title: 'People First',
      description: 'We believe in putting people at the center of everything we do, whether job seekers or employers.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in our platform, our services, and the connections we facilitate.',
    },
    {
      icon: Globe,
      title: 'Inclusivity',
      description: 'We welcome professionals from all backgrounds and experience levels in the hospitality industry.',
    },
  ];

  const team = [
    {
      name: 'Ize Global',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      bio: 'With over 15 years in hospitality management, Ize founded HHH to bridge the gap between talent and opportunity.',
    },
    {
      name: 'Michael Adeyemi',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      bio: 'Michael brings extensive experience in recruitment and talent management to ensure smooth operations.',
    },
    {
      name: 'Sarah Okonkwo',
      role: 'Training Director',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      bio: 'Sarah leads our training programs, helping candidates develop the skills employers are looking for.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">About Hospitality Hire Hub</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Connecting hospitality talent with opportunity across Nigeria and beyond
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To revolutionize hospitality recruitment in Africa by providing a comprehensive platform 
                  that connects skilled professionals with world-class employers. We aim to elevate industry 
                  standards through professional certification, quality training, and meaningful career connections.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Eye className="h-7 w-7 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  To become Africa's leading hospitality career platform, recognized for excellence in 
                  talent development and recruitment. We envision a thriving hospitality industry powered 
                  by skilled, certified professionals matched with employers who value quality service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-6">
                Hospitality Hire Hub was born from a simple observation: despite the booming hospitality 
                industry in Nigeria, there was a significant gap between talented professionals and quality 
                employers. Too many skilled workers struggled to find opportunities, while hotels and 
                restaurants found it difficult to hire the right talent.
              </p>
              <p className="mb-6">
                Founded in 2023, we set out to bridge this gap by creating a platform that does more than 
                just list jobs. We built a comprehensive ecosystem that includes professional certification, 
                skills training, and direct connections between employers and verified candidates.
              </p>
              <p>
                Today, Hospitality Hire Hub serves thousands of professionals and hundreds of employers 
                across Nigeria. Our certification program has become a trusted standard in the industry, 
                and our training resources help candidates continuously improve their skills. We're proud 
                to be contributing to the growth and professionalization of hospitality in Africa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate people behind Hospitality Hire Hub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600 text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: 'Registered Users' },
              { value: '500+', label: 'Partner Hotels' },
              { value: '2,000+', label: 'Jobs Posted' },
              { value: '85%', label: 'Placement Rate' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl lg:text-5xl font-bold text-yellow-300 mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
