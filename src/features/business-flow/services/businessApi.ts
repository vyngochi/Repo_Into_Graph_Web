import { apiClient } from '../../../configs/client';
import { BusinessFlow } from '../types';

export const businessApi = {
  getBusinessFlows: async (baseUrl: string, analysisRunId: string): Promise<BusinessFlow[]> => {
    return apiClient.get<any, BusinessFlow[]>(`/api/businesses`, {
      params: { analysisRunId }
    });
  },
};
