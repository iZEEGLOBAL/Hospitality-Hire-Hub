import { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import api from '../lib/axios';
import type { FAQ as FAQType } from '../types';

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await api.get('/faqs');
      setFaqs(response.data.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQType[]>);

  const categoryLabels: Record<string, string> = {
    general: 'General',
    job_seekers: 'For Job Seekers',
    employers: 'For Employers',
    subscription: 'Subscription & Payment',
    interview: 'Certification Interview',
    technical: 'Technical Support',
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
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Find answers to common questions about Hospitality Hire Hub
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">No FAQs yet</h3>
              <p className="text-gray-600">Check back soon for updates</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedFAQs).map(([category, categoryFaqs]) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {categoryLabels[category] || category}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {categoryFaqs.map((faq) => (
                      <AccordionItem
                        key={faq._id}
                        value={faq._id}
                        className="bg-white rounded-lg border px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
