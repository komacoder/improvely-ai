import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentAPI, CreatePaymentRequest } from './paymentAPI';
import { toast } from 'sonner';
import { generatePlanCheckoutUrl } from '@/lib/paycomUtils';

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      const response = await paymentAPI.createPayment(data);
      return response;
    },
    onSuccess: (data) => {
      if (data.data.paymentMethod === 'Payme') {
        console.log('Backend payment response:', data);
        console.log('Amount from backend:', data.data.amount, 'UZS');
        
        // Generate Paycom checkout URL using the orderId and amount from backend
        // Backend already provides amount in UZS, so we use it directly
        const checkoutUrl = generatePlanCheckoutUrl(
          data.data.orderId,
          data.data.amount, // This is already in UZS
          'uz',
          window.location.origin
        );
        
        // Redirect to Paycom checkout
        window.location.href = checkoutUrl;
        
        toast.success('Redirecting to payment page...');
      } else {
        toast.error('Unsupported payment method');
      }
      
      // Invalidate user profile to refresh plan data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-trial'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      
      // Force refetch user profile
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['user-profile'] });
      }, 1000);
    },
    onError: (error: any) => {
      console.error('Payment creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment');
    },
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      console.log('Fetching user profile...');
      const result = await paymentAPI.getUserProfile();
      console.log('User profile fetched:', result);
      return result;
    },
    staleTime: 0, // Always consider stale
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
