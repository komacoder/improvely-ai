import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/ui/navigation';
import { useAuthContext } from '@/auth/hooks/useAuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, authenticated } = useAuthContext();
  const queryClient = useQueryClient();

  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const orderId = searchParams.get('orderId');
  const planId = searchParams.get('planId');

  useEffect(() => {
    if (!authenticated) {
      // Redirect to login if not authenticated, then return here
      navigate(`/auth/login?redirect=/payment-success?orderId=${orderId}&planId=${planId}`);
      return;
    }

    const verifyPayment = async () => {
      if (!orderId || !planId) {
        setPaymentStatus('failed');
        setMessage('Payment verification failed: Missing order or plan ID.');
        toast({
          title: 'Payment Failed',
          description: 'Missing payment details.',
          variant: 'destructive',
        });
        return;
      }

      try {
        console.log(`Verifying payment for Order ID: ${orderId}, Plan ID: ${planId}`);

        // Simulate payment verification (in real app, this would be a backend call)
        const response = await new Promise<{ success: boolean; message: string }>((resolve) => {
          setTimeout(() => {
            // In a real scenario, this would be a backend call to verify payment
            const isSuccess = Math.random() > 0.1; // 90% chance of success for demo
            if (isSuccess) {
              resolve({ success: true, message: 'Your premium plan has been activated successfully!' });
            } else {
              resolve({ success: false, message: 'Payment could not be verified. Please contact support.' });
            }
          }, 2000); // Simulate network delay
        });

        if (response.success) {
          setPaymentStatus('success');
          setMessage(response.message);
          
          // Invalidate all user-related queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['user-profile'] });
          queryClient.invalidateQueries({ queryKey: ['user-trial'] });
          queryClient.invalidateQueries({ queryKey: ['plans'] });
          
          toast({
            title: 'Payment Successful!',
            description: response.message,
            variant: 'default',
          });
        } else {
          setPaymentStatus('failed');
          setMessage(response.message);
          toast({
            title: 'Payment Failed',
            description: response.message,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error during payment verification:', error);
        setPaymentStatus('failed');
        setMessage('An unexpected error occurred during payment verification.');
        toast({
          title: 'Payment Failed',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    };

    verifyPayment();
  }, [orderId, planId, navigate, authenticated, queryClient]);

  const getIcon = () => {
    if (paymentStatus === 'loading') return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
    if (paymentStatus === 'success') return <CheckCircle className="h-16 w-16 text-green-500" />;
    return <XCircle className="h-16 w-16 text-red-500" />;
  };

  const getTitle = () => {
    if (paymentStatus === 'loading') return 'Processing Payment...';
    if (paymentStatus === 'success') return 'Payment Successful!';
    return 'Payment Failed';
  };

  const getCardClass = () => {
    if (paymentStatus === 'loading') return 'border-blue-300';
    if (paymentStatus === 'success') return 'border-green-300';
    return 'border-red-300';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="py-16 flex items-center justify-center">
        <Card className={`w-full max-w-md text-center shadow-lg ${getCardClass()}`}>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{getTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              {getIcon()}
            </div>
            <p className="text-lg text-muted-foreground">{message}</p>
            {paymentStatus !== 'loading' && (
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/pricing')} 
                  className="w-full"
                  variant={paymentStatus === 'success' ? 'default' : 'outline'}
                >
                  {paymentStatus === 'success' ? 'View Your Plans' : 'Back to Pricing'}
                </Button>
                <Button 
                  onClick={() => navigate('/')} 
                  className="w-full"
                  variant="outline"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PaymentSuccess;
