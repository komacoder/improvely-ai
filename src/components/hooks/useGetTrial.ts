import { useAuthContext } from '@/auth/hooks/useAuthContext';
import http from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetTrial = () => {
  const { user } = useAuthContext();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-trial'],
    enabled: !!user,
    queryFn: async () => {
      try {
        // Try to get user profile first (which contains userPlan)
        const profileRes = await http.get(`/users/profile`).then(r => r.data);
        const userPlan = profileRes?.data?.userPlan;
        
        if (userPlan) {
          return {
            _id: userPlan._id ?? '',
            user: profileRes?.data?._id ?? '',
            plan: userPlan.plan?.title ?? '',
            freeTrialCount: userPlan.subscriptionType === 'FREE' ? (userPlan.submissionsLimit - userPlan.submissionsUsed) : 0,
            premiumTrialCount: userPlan.subscriptionType === 'PREMIUM' ? (userPlan.submissionsLimit - userPlan.submissionsUsed) : 0,
            hasPaidPlan: userPlan.hasPaidPlan ?? false,
            submissionsUsed: userPlan.submissionsUsed ?? 0,
            submissionsLimit: userPlan.submissionsLimit ?? 0,
            remainingSubmissions: Math.max(0, (userPlan.submissionsLimit ?? 0) - (userPlan.submissionsUsed ?? 0)),
          } as {
            _id: string;
            user: string;
            plan: string;
            freeTrialCount: number;
            premiumTrialCount: number;
            hasPaidPlan: boolean;
            submissionsUsed: number;
            submissionsLimit: number;
            remainingSubmissions: number;
          };
        }
        
        const res = await http.get(`/user-plans`).then(r => r.data);
        const payload = Array.isArray(res?.data) ? res.data[0] : (res?.data ?? res);
        return {
          _id: payload?._id ?? '',
          user: payload?.user ?? '',
          plan: payload?.plan ?? '',
          freeTrialCount: payload?.freeTrialCount ?? 0,
          premiumTrialCount: payload?.premiumTrialCount ?? 0,
          hasPaidPlan: payload?.hasPaidPlan ?? Boolean(payload),
          submissionsUsed: payload?.submissionsUsed ?? 0,
          submissionsLimit: payload?.submissionsLimit ?? 0,
          remainingSubmissions: Math.max(0, (payload?.submissionsLimit ?? 0) - (payload?.submissionsUsed ?? 0)),
        } as {
          _id: string;
          user: string;
          plan: string;
          freeTrialCount: number;
          premiumTrialCount: number;
          hasPaidPlan: boolean;
          submissionsUsed: number;
          submissionsLimit: number;
          remainingSubmissions: number;
        };
      } catch (err: any) {
        // 404: User plan not found → fall back to free tier defaults
        if (err?.response?.status === 404) {
          return {
            _id: '',
            user: user?._id ?? '',
            plan: '',
            freeTrialCount: 0,
            premiumTrialCount: 0,
            hasPaidPlan: false,
            submissionsUsed: 0,
            submissionsLimit: 0,
            remainingSubmissions: 0,
          } as {
            _id: string;
            user: string;
            plan: string;
            freeTrialCount: number;
            premiumTrialCount: number;
            hasPaidPlan: boolean;
            submissionsUsed: number;
            submissionsLimit: number;
            remainingSubmissions: number;
          };
        }
        throw err;
      }
    },
    retry: false,
    staleTime: 0, // Always consider stale
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return { data, isLoading, isError };
};
