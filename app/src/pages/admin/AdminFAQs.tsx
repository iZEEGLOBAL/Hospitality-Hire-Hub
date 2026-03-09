import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Plus,
  HelpCircle,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { Link } from 'react-router-dom';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  views: number;
}

export default function AdminFAQs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['adminFAQs'],
    queryFn: async () => {
      const response = await api.get('/admin/faqs');
      return response.data.data.faqs;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ faqId, isActive }: { faqId: string; isActive: boolean }) => {
      const response = await api.patch(`/admin/faqs/${faqId}/toggle`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFAQs'] });
      toast.success('FAQ status has been updated.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status.', { title: 'Error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (faqId: string) => {
      const response = await api.delete(`/admin/faqs/${faqId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFAQs'] });
      toast.success('FAQ has been deleted.', { title: 'FAQ deleted' });
    },
    onError: () => {
      toast.error('Failed to delete FAQ.', { title: 'Error' });
    },
  });

  const filteredFAQs = faqs?.filter((faq: FAQ) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = (id: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenItems(newOpen);
  };

  const categories: string[] = Array.from(new Set(faqs?.map((f: FAQ) => f.category) || []));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600 mt-1">Manage frequently asked questions</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/faqs/create">
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total FAQs</p><p className="text-2xl font-bold">{faqs?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-green-600">{faqs?.filter((f: FAQ) => f.isActive).length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Inactive</p><p className="text-2xl font-bold text-gray-600">{faqs?.filter((f: FAQ) => !f.isActive).length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Views</p><p className="text-2xl font-bold">{faqs?.reduce((acc: number, f: FAQ) => acc + f.views, 0) || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search FAQs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" /><p className="mt-4 text-gray-600">Loading...</p></div>
      ) : filteredFAQs?.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryFAQs = filteredFAQs?.filter((f: FAQ) => f.category === category);
            if (categoryFAQs?.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">{category}</h3>
                <div className="space-y-2">
                  {categoryFAQs?.map((faq: FAQ) => (
                    <Collapsible key={faq._id} open={openItems.has(faq._id)} onOpenChange={() => toggleItem(faq._id)}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardContent className="p-4 cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <HelpCircle className="h-5 w-5 text-brand-600 flex-shrink-0" />
                                <span className="font-medium text-gray-900">{faq.question}</span>
                                {!faq.isActive && <Badge variant="secondary">Inactive</Badge>}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 flex items-center"><Eye className="h-4 w-4 mr-1" />{faq.views}</span>
                                {openItems.has(faq._id) ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0 pb-4 px-4">
                            <div className="pl-8 border-l-2 border-brand-200 ml-2">
                              <p className="text-gray-700 mb-4">{faq.answer}</p>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm"><Edit3 className="h-4 w-4 mr-1" />Edit</Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => toggleMutation.mutate({ faqId: faq._id, isActive: !faq.isActive })}
                                >
                                  {faq.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-red-600"><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Delete FAQ?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this FAQ?</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(faq._id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
