import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansAPI } from '../plansAPI';
import { toast } from 'sonner';
import { useCreatePayment } from '@/services/paymentMutations';

export const useGetPlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: plansAPI.getPlans,
  });
};

export const useCreateOrderPayme = () => {
  const { mutate: createPayment, isPending } = useCreatePayment();

  return {
    mutate: (planId: string) => {
      createPayment({
        planId,
        paymentMethod: 'Payme',
        returnUrl: `${window.location.origin}/payment-success?planId=${planId}`
      });
    },
    isPending
  };
};

export const useCreateOrderClick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => plansAPI.createOrder(planId, 'Click'),
    onSuccess: session => {
      // Redirect to Click payment page with proper parameters
      window.location.href = `https://my.click.uz/services/pay?service_id=65090&merchant_id=34393&amount=${session.totalPrice}&transaction_param=${session._id}`;

      toast.success(
        'Order created successfully. You are being redirected to Click payment page.'
      );
      // Invalidate and refetch plans data after successful order creation
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['all-plans'] });
    },
    onError: error => {
      toast.error('Failed to create order. Please try again.');
    },
  });
};
