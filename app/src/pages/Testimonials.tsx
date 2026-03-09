import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '../lib/axios';
import type { Testimonial } from '../types';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await api.get('/testimonials');
      setTestimonials(response.data.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Testimonials</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Hear from professionals who found success through Hospitality Hire Hub
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {testimonials.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">No testimonials yet</h3>
              <p className="text-gray-600">Be the first to share your success story</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <Card key={testimonial._id} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      {testimonial.photo?.url ? (
                        <img
                          src={testimonial.photo.url}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {testimonial.name[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">
                          {testimonial.role}
                          {testimonial.company && ` at ${testimonial.company}`}
                        </p>
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
