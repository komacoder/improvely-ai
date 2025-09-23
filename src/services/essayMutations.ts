import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { essayAPI } from '@/modules/essay/essayAPI';
import { SendSubmission } from '@/modules/essay/types/SendSubmission';
import {
  Submission,
  IELTSWritingSubmissionStatus,
} from '@/modules/essay/types/Submission';
import { useEffect, useState } from 'react';

export const useSubmitEssay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SendSubmission) => {
      const response = await essayAPI.postSubmission(data);
      return response;
    },
    onSuccess: async (res: any) => {
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      await queryClient.invalidateQueries({ queryKey: ['latest-submission'] });
    },
    onError: error => {
      console.error('Essay submission error:', error);
    },
  });
};

export const useSubmissions = (enabled: boolean = true) => {
  const [isPendingAnalysed, setIsPendingAnalysed] = useState<null | boolean>(
    null
  );

  const { data, ...queryResult } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => essayAPI.getSubmissions(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled,
    refetchInterval: ({ state }) => {
      const res = state.data;
      if (res && res.length > 0) {
        const latestSubmission = res[0];
        if (
          latestSubmission.status === 'IDLE' ||
          latestSubmission.status === 'IN_PROGRESS'
        ) {
          setIsPendingAnalysed(false);
          return 5000; // 5 seconds
        }
      }
      return false; // Don't refetch if all submissions are analyzed
    },
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const latestSubmission = data[0];
      if (
        (latestSubmission.status === IELTSWritingSubmissionStatus.ANALYZED ||
          latestSubmission.status ===
            IELTSWritingSubmissionStatus.FAILED_TO_CHECK) &&
        isPendingAnalysed === false
      ) {
        setIsPendingAnalysed(true);
      }
    }
  }, [data, isPendingAnalysed]);

  return {
    ...queryResult,
    data,
    isPendingAnalysed,
  };
};

export const useLatestSubmission = (enabled: boolean = true) => {
  const {
    data: submissions,
    isPendingAnalysed,
    ...queryResult
  } = useSubmissions(enabled);

  const latestSubmission =
    submissions && submissions.length > 0 ? submissions[0] : null;
  return {
    ...queryResult,
    data: latestSubmission,
    isProcessing:
      latestSubmission?.status === 'IDLE' ||
      latestSubmission?.status === 'IN_PROGRESS',
    isAnalyzed: latestSubmission?.status === 'ANALYZED',
    isFailed: latestSubmission?.status === 'FAILED_TO_CHECK',
    isPendingAnalysed,
  };
};

export const useSubmissionById = (submissionId: string | null | undefined) => {
  return useQuery({
    queryKey: ['submission', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const response = await essayAPI.getSubmissionById(submissionId);
      return response.data || response;
    },
    enabled: !!submissionId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAnalyzeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await essayAPI.analyzeSubmission(submissionId);
      return response;
    },
    onSuccess: async (data, submissionId) => {
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      await queryClient.invalidateQueries({ queryKey: ['latest-submission'] });
      await queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
    },
    onError: error => {
      console.error('Essay analysis error:', error);
    },
  });
};

export const useGenerateImprovedVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submissionId: string) => {
      const response = await essayAPI.generateImprovedVersion(submissionId);
      return response;
    },
    onSuccess: async (data, submissionId) => {
      await queryClient.invalidateQueries({ queryKey: ['submissions'] });
      await queryClient.invalidateQueries({ queryKey: ['latest-submission'] });
      await queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
    },
    onError: error => {
      console.error('Improved version generation error:', error);
    },
  });
};
