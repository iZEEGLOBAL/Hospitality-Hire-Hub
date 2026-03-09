import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '../lib/axios';
import { toast } from 'sonner';

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    if (reference || trxref) {
      verifyPayment();
    } else {
      setStatus('error');
      setMessage('No payment reference found');
    }
  }, [reference, trxref]);

  const verifyPayment = async () => {
    try {
      const response = await api.post('/payments/verify', {
        reference: reference || trxref,
      });

      if (response.data.data.status === 'completed') {
        setStatus('success');
        setMessage('Payment successful! Your subscription has been activated.');
        toast.success('Payment verified successfully!');
      } else {
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Payment verification failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we verify your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/pricing')}>
                  Try Again
                </Button>
                <Button onClick={() => navigate('/contact')}>
                  Contact Support
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
