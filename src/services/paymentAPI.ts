import http from '@/services/api';

export interface CreatePaymentRequest {
  planId: string;
  paymentMethod: 'Payme' | 'Paycom' | 'Click';
  returnUrl: string;
}

export interface CreatePaymentResponse {
  message: string;
  data: {
    orderId: string;
    amount: number;
    planName: string;
    paymentMethod: string;
    instructions: string;
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    planName: string;
    planId: string;
    expiresAt: string;
  };
}

export const paymentAPI = {
  /**
   * Create payment for plan upgrade
   */
  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await http.post('/payments/create', data);
    return response.data;
  },

  /**
   * Get user profile with plan information
   */
  getUserProfile: async (): Promise<any> => {
    const response = await http.get('/users/profile');
    return response.data;
  },

  /**
   * Verify payment completion
   */
  verifyPayment: async (orderId: string): Promise<VerifyPaymentResponse> => {
    const response = await http.post('/payments/verify', { orderId });
    return response.data;
  }
};
