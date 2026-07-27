import { apiClient } from "../../../configs/client";
import { FewShotExample } from "../types";

export const quizApi = {
  getFewShots: async (baseUrl: string): Promise<FewShotExample[]> => {
    const data = await apiClient.get<any, any>(`/api/fewshot`);
    return data.items || [];
  },

  generateQuestions: async (payload: any): Promise<any> => {
    return apiClient.post(`/api/QuestionGenerator/generate`, payload);
  },

  assessCoverage: async (payload: any): Promise<any> => {
    return apiClient.post(
      `/api/WorkflowAssessment/assess-from-response`,
      payload,
    );
  },

  assessAccuracy: async (payload: any): Promise<any> => {
    return apiClient.post(`/api/WorkflowAssessment/assess-accuracy`, payload);
  },

  assessDifficulty: async (payload: any): Promise<any> => {
    return apiClient.post(`/api/WorkflowAssessment/assess-difficulty`, payload);
  },
};
