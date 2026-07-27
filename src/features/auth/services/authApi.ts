import { apiClient } from '../../../configs/client';

export const authApi = {
  checkHealth: async (serverUrl: string) => {
    return apiClient.get(`/api/health`, { timeout: 5000 });
  },
};
