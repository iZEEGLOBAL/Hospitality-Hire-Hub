import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const plans = [
    {
      name: 'Free',
      description: 'For job seekers getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      currency: 'NGN',
      features: [
        { text: 'Create basic profile', included: true },
        { text: 'Browse jobs', included: true },
        { text: 'Save jobs', included: true },
        { text: 'Access free resources', included: true },
        { text: 'Apply to jobs', included: false },
        { text: 'Certification interview', included: false },
        { text: 'Premium resources', included: false },
        { text: 'Priority support', included: false },
      ],
      cta: 'Get Started',
      popular: false,
      role: 'jobseeker',
    },
    {
      name: 'Pro',
      description: 'For serious job seekers',
      monthlyPrice: 5000,
      yearlyPrice: 50000,
      currency: 'NGN',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Apply to unlimited jobs', included: true },
        { text: 'Certification interview', included: true },
        { text: 'All training courses', included: true },
        { text: 'Premium resources', included: true },
        { text: 'Resume review', included: true },
        { text: 'Job alerts', included: true },
        { text: 'Priority support', included: false },
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      role: 'jobseeker',
    },
    {
      name: 'Business',
      description: 'For employers and recruiters',
      monthlyPrice: 25000,
      yearlyPrice: 250000,
      currency: 'NGN',
      features: [
        { text: 'Post up to 20 jobs', included: true },
        { text: 'Search certified candidates', included: true },
        { text: 'Contact candidates directly', included: true },
        { text: 'Application tracking', included: true },
        { text: 'Company profile', included: true },
        { text: 'Analytics dashboard', included: true },
        { text: 'Priority support', included: true },
        { text: 'Featured job listings', included: true },
      ],
      cta: 'Get Business',
      popular: false,
      role: 'employer',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Choose the plan that's right for you
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly
              <Badge className="ml-2 bg-green-100 text-green-700">Save 17%</Badge>
            </span>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`border-0 shadow-xl ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.currency} {isYearly ? plan.yearlyPrice.toLocaleString() : plan.monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-gray-500">/{isYearly ? 'year' : 'month'}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isAuthenticated ? (
                    user?.subscription?.plan === plan.name.toLowerCase() ? (
                      <Button className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                            : ''
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    )
                  ) : (
                    <Link to="/register">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                            : ''
                        }`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accepted Payment Methods</h3>
            <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-gray-600">Paystack</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-gray-600">Bank Transfer</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">USDT (TRC20)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
