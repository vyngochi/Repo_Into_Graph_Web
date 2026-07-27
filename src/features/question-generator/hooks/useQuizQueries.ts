import { useQuery } from '@tanstack/react-query';
import { quizApi } from '../services/quizApi';
import { useAppStore } from '../../../store/useAppStore';

export const useFewShots = () => {
  const { serverUrl } = useAppStore();
  return useQuery({
    queryKey: ['few-shots', serverUrl],
    queryFn: () => quizApi.getFewShots(serverUrl),
    enabled: !!serverUrl,
  });
};
