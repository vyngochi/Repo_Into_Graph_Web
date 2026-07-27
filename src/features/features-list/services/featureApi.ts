import { apiClient } from '../../../configs/client';
import { FeatureDetail, FeaturePagedResult } from '../types';

export const featureApi = {
  getFeatures: async (baseUrl: string, analysisRunId?: string): Promise<FeatureDetail[]> => {
    if (analysisRunId) {
      return apiClient.get<any, FeatureDetail[]>(`/api/features/by-analysis-run/${analysisRunId}`);
    }
    const data = await apiClient.get<any, FeaturePagedResult>(`/api/features`);
    return data.items || [];
  },

  getFeatureById: async (baseUrl: string, id: string): Promise<FeatureDetail> => {
    return apiClient.get<any, FeatureDetail>(`/api/features/${id}`);
  }
};
