import { useQuery } from '@tanstack/react-query';
import { topicAPI } from '@/modules/topic/topicAPI';
import { Topic } from '@/modules/topic/types/Topic';

export const useTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: async (): Promise<Topic[]> => {
      const topics = await topicAPI.getAll();
      return topics;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, 
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useTopicsByType = (type: 'TASK_ONE' | 'TASK_TWO') => {
  return useQuery({
    queryKey: ['topics', type],
    queryFn: async (): Promise<Topic[]> => {
      const allTopics = await topicAPI.getAll();
      return allTopics.filter(topic => topic.type === type);
    },
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useTopic = (id: string) => {
  return useQuery({
    queryKey: ['topic', id],
    queryFn: async (): Promise<Topic | undefined> => {
      const allTopics = await topicAPI.getAll();
      return allTopics.find(topic => topic._id === id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
