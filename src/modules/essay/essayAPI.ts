import http from '@/services/api';
import { SendSubmission } from './types/SendSubmission';
import { PaginationRes } from '@/types/PaginationRes';
import { Submission } from './types/Submission';

export const essayAPI = {
  // IELTS Writing Tasks (Admin endpoints included for completeness)
  createTask: async (data: { title: string; question: string; type: 'TASK_ONE' | 'TASK_TWO' }) => {
    const response = await http.post('ielts-writing', data);
    return response.data;
  },
  getTasks: async () => {
    const response = await http.get('ielts-writing');
    return response.data;
  },
  getTaskById: async (id: string) => {
    const response = await http.get(`ielts-writing/${id}`);
    return response.data;
  },
  updateTask: async (
    id: string,
    data: { title?: string; question?: string; type?: 'TASK_ONE' | 'TASK_TWO' }
  ) => {
    const response = await http.patch(`ielts-writing/${id}`, data);
    return response.data;
  },
  deleteTask: async (id: string) => {
    const response = await http.delete(`ielts-writing/${id}`);
    return response.data;
  },

  // Submissions
  // Backward-compatible name used by hooks/components
  postSubmission: async (data: SendSubmission) => {
    const response = await http.post('ielts-writing-submission', data);
    return response.data;
  },
  // Backward-compatible: return current user's submissions (not admin list)
  getSubmissions: async () => {
    const response = await http.get<PaginationRes<Submission>>(
      'ielts-writing-submission/my-submissions'
    );
    // Some endpoints return { data: [...] }, others may return pagination
    // Normalize to an array for existing consumers
    return (response.data?.data as unknown) || response.data;
  },

  // Additional submission endpoints
  getAllSubmissionsAdmin: async () => {
    const response = await http.get('ielts-writing-submission');
    return response.data;
  },
  getSubmissionById: async (id: string) => {
    const response = await http.get(`ielts-writing-submission/${id}`);
    return response.data;
  },
  updateSubmission: async (
    id: string,
    data: Partial<{
      writing: string;
      customWritingQuestion: string;
      body: string;
      topic: 'GENERATED' | 'CUSTOM';
      status: 'IDLE' | 'IN_PROGRESS' | 'ANALYZED' | 'FAILED_TO_CHECK';
      targetScore: 'BAND_SEVEN' | 'BAND_EIGHT' | 'BAND_NINE';
    }>
  ) => {
    const response = await http.patch(`ielts-writing-submission/${id}`, data);
    return response.data;
  },
  deleteSubmission: async (id: string) => {
    const response = await http.delete(`ielts-writing-submission/${id}`);
    return response.data;
  },
  updateSubmissionStatus: async (
    id: string,
    status: 'IDLE' | 'IN_PROGRESS' | 'ANALYZED' | 'FAILED_TO_CHECK'
  ) => {
    const response = await http.patch(
      `ielts-writing-submission/${id}/status`,
      undefined,
      { params: { status } }
    );
    return response.data;
  },
  getSubmissionLimit: async () => {
    const response = await http.get('ielts-writing-submission/submission-limit');
    return response.data;
  },

  // AI Analysis
  analyzeSubmission: async (id: string) => {
    const response = await http.post(`ielts-ai/analyze/${id}`, {});
    return response.data;
  },
  generateImprovedVersion: async (id: string) => {
    const response = await http.post(`ielts-ai/improved-version/${id}`, {});
    return response.data;
  },
};
