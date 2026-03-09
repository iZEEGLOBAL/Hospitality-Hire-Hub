import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Plus,
  Star,
  Quote,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  User,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminTestimonials() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: async () => {
      const response = await api.get('/admin/testimonials');
      return response.data.data.testimonials;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ testimonialId, isApproved }: { testimonialId: string; isApproved: boolean }) => {
      const response = await api.patch(`/admin/testimonials/${testimonialId}/approve`, { isApproved });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      toast.success('Testimonial status has been updated.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status.', { title: 'Error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (testimonialId: string) => {
      const response = await api.delete(`/admin/testimonials/${testimonialId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      toast.success('Testimonial has been deleted.', { title: 'Testimonial deleted' });
    },
    onError: () => {
      toast.error('Failed to delete testimonial.', { title: 'Error' });
    },
  });

  const filteredTestimonials = testimonials?.filter((t: Testimonial) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonial Management</h1>
          <p className="text-gray-600 mt-1">Manage user testimonials and reviews</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/admin/testimonials/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{testimonials?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Approved</p><p className="text-2xl font-bold text-green-600">{testimonials?.filter((t: Testimonial) => t.isApproved).length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-yellow-600">{testimonials?.filter((t: Testimonial) => !t.isApproved).length || 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Avg Rating</p><p className="text-2xl font-bold">{(testimonials?.reduce((acc: number, t: Testimonial) => acc + t.rating, 0) / (testimonials?.length || 1)).toFixed(1)}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search testimonials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TestimonialsList 
            testimonials={filteredTestimonials} 
            isLoading={isLoading}
            approveMutation={approveMutation}
            deleteMutation={deleteMutation}
            renderStars={renderStars}
          />
        </TabsContent>

        <TabsContent value="approved">
          <TestimonialsList 
            testimonials={filteredTestimonials?.filter((t: Testimonial) => t.isApproved)} 
            isLoading={isLoading}
            approveMutation={approveMutation}
            deleteMutation={deleteMutation}
            renderStars={renderStars}
          />
        </TabsContent>

        <TabsContent value="pending">
          <TestimonialsList 
            testimonials={filteredTestimonials?.filter((t: Testimonial) => !t.isApproved)} 
            isLoading={isLoading}
            approveMutation={approveMutation}
            deleteMutation={deleteMutation}
            renderStars={renderStars}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TestimonialsList({ 
  testimonials, 
  isLoading, 
  approveMutation,
  deleteMutation,
  renderStars
}: any) {
  if (isLoading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" /><p className="mt-4 text-gray-600">Loading...</p></div>;
  }

  if (testimonials?.length === 0) {
    return <Card><CardContent className="p-12 text-center"><Quote className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3></CardContent></Card>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {testimonials?.map((testimonial: Testimonial) => (
        <Card key={testimonial._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {testimonial.image ? (
                  <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-brand-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  {testimonial.isApproved ? (
                    <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800"><XCircle className="h-3 w-3 mr-1" />Pending</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
                <p className="text-sm text-gray-500 flex items-center"><Building2 className="h-3 w-3 mr-1" />{testimonial.company}</p>
                <div className="flex items-center gap-1 mt-1">{renderStars(testimonial.rating)}</div>
                <p className="text-gray-700 mt-3 line-clamp-3">"{testimonial.content}"</p>
                <div className="flex gap-2 mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Testimonial Details</DialogTitle></DialogHeader>
                      {testimonial && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center overflow-hidden">
                              {testimonial.image ? <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" /> : <User className="h-8 w-8 text-brand-600" />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                              <p className="text-gray-600">{testimonial.role}</p>
                              <p className="text-gray-500">{testimonial.company}</p>
                              <div className="flex items-center gap-1 mt-1">{renderStars(testimonial.rating)}</div>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <Quote className="h-6 w-6 text-brand-300 mb-2" />
                            <p className="text-gray-700 italic">{testimonial.content}</p>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  {!testimonial.isApproved && <Button size="sm" onClick={() => approveMutation.mutate({ testimonialId: testimonial._id, isApproved: true })}><CheckCircle className="h-4 w-4 mr-1" />Approve</Button>}
                  {testimonial.isApproved && <Button variant="outline" size="sm" onClick={() => approveMutation.mutate({ testimonialId: testimonial._id, isApproved: false })}><XCircle className="h-4 w-4 mr-1" />Unapprove</Button>}
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="text-red-600"><Trash2 className="h-4 w-4 mr-1" />Delete</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete Testimonial?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete this testimonial?</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteMutation.mutate(testimonial._id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
