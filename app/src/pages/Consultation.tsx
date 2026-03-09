import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Building2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function Consultation() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    propertyDescription: '',
    type: 'online',
    preferredDate: '',
    preferredTime: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to book a consultation');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Consultation request submitted! We will contact you shortly.');
      setFormData({
        businessName: '',
        businessType: '',
        propertyDescription: '',
        type: 'online',
        preferredDate: '',
        preferredTime: '',
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const benefits = [
    'Expert advice from industry professionals',
    'Customized solutions for your business',
    'Staff training recommendations',
    'Operational efficiency improvements',
    'Growth strategy development',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Book a Consultation</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Get expert advice for your hospitality business
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Professional Hospitality Consulting
              </h2>
              <p className="text-gray-600 mb-6">
                Whether you're starting a new hospitality venture or looking to improve your existing 
                operations, our expert consultants are here to help you succeed.
              </p>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Video className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">Online Consultation</h3>
                    <p className="text-sm text-gray-500 mt-1">Via video call</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900">On-site Visit</h3>
                    <p className="text-sm text-gray-500 mt-1">Physical consultation</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Form */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Request Consultation</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Your hotel or restaurant name"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="resort">Resort</SelectItem>
                        <SelectItem value="catering">Catering</SelectItem>
                        <SelectItem value="event_venue">Event Venue</SelectItem>
                        <SelectItem value="spa">Spa</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyDescription">Tell us about your property</Label>
                    <Textarea
                      id="propertyDescription"
                      placeholder="Describe your business, current challenges, and what you hope to achieve..."
                      rows={4}
                      value={formData.propertyDescription}
                      onChange={(e) => setFormData({ ...formData, propertyDescription: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Consultation Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'online' })}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          formData.type === 'online'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Video className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <span className="font-medium">Online</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'physical' })}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          formData.type === 'physical'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <span className="font-medium">Physical</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">Preferred Date</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Preferred Time</Label>
                      <Input
                        id="preferredTime"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    disabled={isSubmitting}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Request Consultation'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
