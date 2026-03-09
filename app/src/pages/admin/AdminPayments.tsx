import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  DollarSign,
  CreditCard,
  Wallet,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye
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

interface Payment {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  currency: string;
  type: 'job_posting' | 'featured_listing' | 'subscription' | 'consultation' | 'certification';
  method: 'paystack' | 'usdt' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  metadata: {
    jobId?: string;
    consultationId?: string;
    transactionReference?: string;
    walletAddress?: string;
    bankDetails?: string;
  };
  createdAt: string;
  processedAt?: string;
}

export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['adminPayments'],
    queryFn: async () => {
      const response = await api.get('/admin/payments');
      return response.data.data.payments;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: string }) => {
      const response = await api.patch(`/admin/payments/${paymentId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayments'] });
      toast.success('Payment status has been updated.', { title: 'Status updated' });
    },
    onError: () => {
      toast.error('Failed to update status.', { title: 'Error' });
    },
  });

  const filteredPayments = payments?.filter((payment: Payment) =>
    `${payment.user.firstName} ${payment.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'paystack':
        return <CreditCard className="h-4 w-4" />;
      case 'usdt':
        return <Wallet className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      job_posting: 'Job Posting',
      featured_listing: 'Featured Listing',
      subscription: 'Subscription',
      consultation: 'Consultation',
      certification: 'Certification',
    };
    return labels[type] || type;
  };

  const getPaymentsByStatus = (status: string) => {
    if (status === 'all') return filteredPayments;
    return filteredPayments?.filter((p: Payment) => p.status === status);
  };

  const totalRevenue = payments
    ?.filter((p: Payment) => p.status === 'completed')
    .reduce((acc: number, p: Payment) => acc + p.amount, 0) || 0;

  const pendingAmount = payments
    ?.filter((p: Payment) => p.status === 'pending')
    .reduce((acc: number, p: Payment) => acc + p.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600 mt-1">
          Manage and track all payments on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              ${pendingAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold">{payments?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Today's Revenue</p>
            <p className="text-2xl font-bold">
              ${payments
                ?.filter((p: Payment) => {
                  const today = new Date();
                  const paymentDate = new Date(p.createdAt);
                  return today.toDateString() === paymentDate.toDateString() && p.status === 'completed';
                })
                .reduce((acc: number, p: Payment) => acc + p.amount, 0)
                .toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search payments by user or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="refunded">Refunded</TabsTrigger>
        </TabsList>

        {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
          <TabsContent key={status} value={status}>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
                <p className="mt-4 text-gray-600">Loading payments...</p>
              </div>
            ) : getPaymentsByStatus(status)?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getPaymentsByStatus(status)?.map((payment: Payment) => (
                  <Card key={payment._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getMethodIcon(payment.method)}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {payment.user.firstName} {payment.user.lastName}
                            </h3>
                            <Badge variant="outline">{getTypeLabel(payment.type)}</Badge>
                            {getStatusBadge(payment.status)}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{payment.description}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {payment.currency} {payment.amount.toLocaleString()}
                            </span>
                            <span className="flex items-center capitalize">
                              {getMethodIcon(payment.method)}
                              <span className="ml-1">{payment.method.replace('_', ' ')}</span>
                            </span>
                            <span>
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </span>
                            {payment.metadata.transactionReference && (
                              <span className="text-gray-500">
                                Ref: {payment.metadata.transactionReference}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(payment)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                              </DialogHeader>
                              {selectedPayment && (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <div>
                                      <p className="text-sm text-gray-600">Amount</p>
                                      <p className="text-2xl font-bold">
                                        {selectedPayment.currency} {selectedPayment.amount.toLocaleString()}
                                      </p>
                                    </div>
                                    {getStatusBadge(selectedPayment.status)}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">User:</span>
                                      <p>{selectedPayment.user.firstName} {selectedPayment.user.lastName}</p>
                                      <p className="text-gray-600">{selectedPayment.user.email}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Type:</span>
                                      <p>{getTypeLabel(selectedPayment.type)}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Method:</span>
                                      <p className="capitalize">{selectedPayment.method.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Date:</span>
                                      <p>{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-gray-500">Description:</span>
                                    <p className="text-sm">{selectedPayment.description}</p>
                                  </div>

                                  {selectedPayment.metadata.walletAddress && (
                                    <div>
                                      <span className="text-gray-500">Wallet Address:</span>
                                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                                        {selectedPayment.metadata.walletAddress}
                                      </p>
                                    </div>
                                  )}

                                  {selectedPayment.metadata.bankDetails && (
                                    <div>
                                      <span className="text-gray-500">Bank Details:</span>
                                      <p className="text-sm">{selectedPayment.metadata.bankDetails}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {payment.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => statusMutation.mutate({ paymentId: payment._id, status: 'completed' })}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => statusMutation.mutate({ paymentId: payment._id, status: 'failed' })}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
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
