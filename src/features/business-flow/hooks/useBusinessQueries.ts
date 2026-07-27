import { useQuery } from '@tanstack/react-query';
import { businessApi } from '../services/businessApi';
import { useAppStore } from '../../../store/useAppStore';

export const useBusinessFlows = (analysisRunId: string) => {
  const { serverUrl } = useAppStore();
  return useQuery({
    queryKey: ['business-flows', serverUrl, analysisRunId],
    queryFn: () => businessApi.getBusinessFlows(serverUrl, analysisRunId),
    enabled: !!serverUrl && !!analysisRunId,
  });
};
