import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../services/dashboardApi";
import { useAppStore } from "../../../store/useAppStore";

export const useAnalysisRuns = () => {
  const { serverUrl } = useAppStore();
  return useQuery({
    queryKey: ["analysis-runs", serverUrl],
    queryFn: () => dashboardApi.getAnalysisRuns(serverUrl),
    enabled: !!serverUrl,
  });
};

export const useUpdateAnalysisRun = () => {
  const { showToast } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      dashboardApi.updateAnalysisRun(id, payload),
    onSuccess: () => {
      showToast("Cập nhật thông tin thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["analysis-runs"] });
    },
    onError: (err: any) => {
      showToast(
        err.response?.data?.error || "Lỗi khi cập nhật thông tin",
        "error",
      );
    },
  });
};

export const useAnalyzeRepo = () => {
  const { serverUrl, showToast } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      repositoryPath: string;
      outputDir?: string | null;
    }) => dashboardApi.analyzeRepo(payload),
    onSuccess: () => {
      showToast("Phân tích thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["analysis-runs"] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || "Phân tích thất bại.", "error");
    },
  });
};

export const useFewShots = () => {
  const { serverUrl } = useAppStore();
  return useQuery({
    queryKey: ["few-shots", serverUrl],
    queryFn: () => dashboardApi.getFewShots(serverUrl),
    enabled: !!serverUrl,
  });
};

export const useCreateFewShot = () => {
  const { serverUrl, showToast } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => dashboardApi.createFewShot(payload),
    onSuccess: () => {
      showToast("Tạo câu hỏi mẫu thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["few-shots"] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || "Lỗi khi tạo", "error");
    },
  });
};

export const useUpdateFewShot = () => {
  const { serverUrl, showToast } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      dashboardApi.updateFewShot(id, payload),
    onSuccess: () => {
      showToast("Cập nhật thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["few-shots"] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || "Lỗi khi cập nhật", "error");
    },
  });
};

export const useDeleteFewShot = () => {
  const { serverUrl, showToast } = useAppStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dashboardApi.deleteFewShot(id),
    onSuccess: () => {
      showToast("Xóa thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["few-shots"] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || "Lỗi khi xóa", "error");
    },
  });
};
