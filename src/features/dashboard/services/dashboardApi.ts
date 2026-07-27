import { apiClient } from "../../../configs/client";
import { AnalysisRun, FewShot, PagedResult } from "../types";

export const dashboardApi = {
  getAnalysisRuns: async (baseUrl: string): Promise<AnalysisRun[]> => {
    const data = await apiClient.get<any, PagedResult<AnalysisRun>>(
      `/api/analysis-runs`,
    );
    return data.items || [];
  },

  updateAnalysisRun: async (
    baseUrl: string,
    id: string,
    payload: Partial<AnalysisRun>,
  ) => {
    return apiClient.put(`/api/analysis-runs/${id}`, payload);
  },

  analyzeRepo: async (
    baseUrl: string,
    payload: { repositoryPath: string; outputDir?: string | null },
  ) => {
    return apiClient.post(`/api/analysis`, payload);
  },

  getFewShots: async (baseUrl: string): Promise<FewShot[]> => {
    const data = await apiClient.get<any, PagedResult<FewShot>>(`/api/fewshot`);
    return data.items || [];
  },

  createFewShot: async (baseUrl: string, payload: Omit<FewShot, "id">) => {
    return apiClient.post(`/api/fewshot`, payload);
  },

  updateFewShot: async (
    baseUrl: string,
    id: string,
    payload: Partial<FewShot>,
  ) => {
    return apiClient.put(`/api/fewshot/${id}`, payload);
  },

  deleteFewShot: async (baseUrl: string, id: string) => {
    return apiClient.delete(`/api/fewshot/${id}`);
  },
};
