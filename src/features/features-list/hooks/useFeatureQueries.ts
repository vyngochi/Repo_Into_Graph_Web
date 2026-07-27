import { useQuery } from '@tanstack/react-query';
import { featureApi } from '../services/featureApi';
import { useAppStore } from '../../../store/useAppStore';

export const useFeatures = (analysisRunId?: string) => {
  const { serverUrl } = useAppStore();
  return useQuery({
    queryKey: ['features', serverUrl, analysisRunId],
    queryFn: () => featureApi.getFeatures(serverUrl, analysisRunId),
    enabled: !!serverUrl,
  });
};

export const useFeatureDetail = (featureId?: string) => {
  const { serverUrl } = useAppStore();
  return useQuery({
    queryKey: ['feature-detail', serverUrl, featureId],
    queryFn: () => featureApi.getFeatureById(serverUrl, featureId!),
    enabled: !!serverUrl && !!featureId,
  });
};
