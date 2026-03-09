import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign
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
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

interface Consultation {
  _id: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  consultant: {
    firstName: string;
    lastName: string;
  };
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: string;
  duration: number;
  amount: number;
  currency: string;
  notes: string;
  meetingLink?: string;
  createdAt: string;
}

export default function AdminConsultations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: consultations, isLoading } = useQuery({
    queryKey: ['adminConsultations'],
    queryFn: async () => {
      const response = await api.get('/admin/consultations');
      return response.data.data.consultations;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ consultationId, status }: { consultationId: string; status: string }) => {
      const response = await api.patch(`/admin/consultations/${consultationId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConsultations'] });
      toast.success('Consultation status has been updated.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status.', { title: 'Error' });
    },
  });

  const filteredConsultations = consultations?.filter((c: Consultation) =>
    `${c.client.firstName} ${c.client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConsultationsByStatus = (status: string) => {
    if (status === 'all') return filteredConsultations;
    return filteredConsultations?.filter((c: Consultation) => c.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultation Management</h1>
        <p className="text-gray-600 mt-1">
          Manage all consultation bookings on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold">{consultations?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold">{consultations?.filter((c: Consultation) => c.status === 'pending').length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Confirmed</p>
            <p className="text-2xl font-bold">{consultations?.filter((c: Consultation) => c.status === 'confirmed').length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold">{consultations?.filter((c: Consultation) => c.status === 'completed').length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search consultations by client or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Consultations Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading consultations...</p>
              </div>
            ) : getConsultationsByStatus(status)?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getConsultationsByStatus(status)?.map((consultation: Consultation) => (
                  <Card key={consultation._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-brand-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {consultation.client.firstName} {consultation.client.lastName}
                            </h3>
                            <Badge variant="outline" className="capitalize">{consultation.type}</Badge>
                            {getStatusBadge(consultation.status)}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(consultation.scheduledDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {consultation.duration} minutes
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {consultation.currency} {consultation.amount}
                            </span>
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {consultation.consultant.firstName} {consultation.consultant.lastName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedConsultation(consultation)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Consultation Details</DialogTitle>
                              </DialogHeader>
                              {selectedConsultation && (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    {getStatusBadge(selectedConsultation.status)}
                                    <Badge variant="outline" className="capitalize">{selectedConsultation.type}</Badge>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Client:</span>
                                      <p className="font-medium">{selectedConsultation.client.firstName} {selectedConsultation.client.lastName}</p>
                                      <p className="text-gray-600">{selectedConsultation.client.email}</p>
                                      <p className="text-gray-600">{selectedConsultation.client.phone}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Consultant:</span>
                                      <p>{selectedConsultation.consultant.firstName} {selectedConsultation.consultant.lastName}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Date & Time:</span>
                                      <p>{new Date(selectedConsultation.scheduledDate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Duration:</span>
                                      <p>{selectedConsultation.duration} minutes</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Amount:</span>
                                      <p>{selectedConsultation.currency} {selectedConsultation.amount}</p>
                                    </div>
                                  </div>

                                  {selectedConsultation.meetingLink && (
                                    <div>
                                      <span className="text-gray-500">Meeting Link:</span>
                                      <a 
                                        href={selectedConsultation.meetingLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-brand-600 hover:underline block"
                                      >
                                        {selectedConsultation.meetingLink}
                                      </a>
                                    </div>
                                  )}

                                  {selectedConsultation.notes && (
                                    <div>
                                      <span className="text-gray-500">Notes:</span>
                                      <p className="text-sm">{selectedConsultation.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {consultation.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => statusMutation.mutate({ consultationId: consultation._id, status: 'confirmed' })}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                          )}

                          {consultation.status === 'confirmed' && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => statusMutation.mutate({ consultationId: consultation._id, status: 'completed' })}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
