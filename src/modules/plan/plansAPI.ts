import http from '@/services/api';
import { Plan } from './types/Plan';

export const plansAPI = {
  // Public and user-facing plan endpoints
  getPlans: async () =>
    http.get<{ data: Plan[] }>(`/plans`).then(res => res.data.data ?? res.data),
  getActivePlans: async () =>
    http
      .get<{ data: Plan[] }>(`/plans/active`)
      .then(res => res.data.data ?? res.data),
  getPopularPlans: async () =>
    http
      .get<{ data: Plan[] }>(`/plans/popular`)
      .then(res => res.data.data ?? res.data),
  getPlanById: async (id: string) =>
    http.get(`/plans/${id}`).then(res => res.data),

  // Admin: create/update/delete/duplicate with optional icon upload (multipart/form-data)
  createPlan: async (
    payload: Partial<{
      title: string;
      description: string;
      features: string[];
      price: number;
      currency: string;
      durationInDays: number;
      trialCount: number;
      isActive: boolean;
      billingCycle: string;
      type: string;
      tags: string[];
      maxUsers: number;
      maxSubmissions: number;
      isPopular: boolean;
      sortOrder: number;
      icon: File | null | undefined;
    }>
  ) => {
    const form = new FormData();
    Object.entries(payload ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'features' || key === 'tags') {
        (value as string[]).forEach(v => form.append(key, v));
      } else if (key === 'icon' && value instanceof File) {
        form.append('icon', value);
      } else {
        form.append(key, String(value));
      }
    });
    const res = await http.post(`/plans`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  updatePlan: async (
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      features: string[];
      price: number;
      currency: string;
      durationInDays: number;
      trialCount: number;
      isActive: boolean;
      billingCycle: string;
      type: string;
      status: string;
      tags: string[];
      maxUsers: number;
      maxSubmissions: number;
      isPopular: boolean;
      sortOrder: number;
      icon: File | null | undefined;
    }>
  ) => {
    const form = new FormData();
    Object.entries(payload ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'features' || key === 'tags') {
        (value as string[]).forEach(v => form.append(key, v));
      } else if (key === 'icon' && value instanceof File) {
        form.append('icon', value);
      } else {
        form.append(key, String(value));
      }
    });
    const res = await http.patch(`/plans/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deletePlan: async (id: string) =>
    http.delete(`/plans/${id}`).then(res => res.data),
  duplicatePlan: async (id: string) =>
    http.post(`/plans/${id}/duplicate`).then(res => res.data),
  getPlanStats: async () => http.get(`/plans/stats`).then(res => res.data),

  // User plans
  getCurrentUserPlan: async () =>
    http.get(`/user-plans`).then(res => res.data),
  processMockPayment: async (planId: string, paymentMethod: 'Click' | 'Payme') =>
    http
      .post(`/user-plans/payment`, { planId, paymentMethod })
      .then(res => res.data),
  getUserPlanAnalytics: async () =>
    http.get(`/user-plans/analytics`).then(res => res.data),

  // Payment processing using the correct endpoint
  createOrder: async (planId: string, paymentMethod: 'Click' | 'Payme' = 'Payme') =>
    http
      .post<{
        data: {
          session: {
            paymentProvider: 'PAYME' | 'CLICK';
            _id: string;
            totalPrice: number;
          };
        };
      }>(`/user-plans/payment`, {
        planId,
        paymentMethod,
      })
      .then(res => res.data.data.session),
};
