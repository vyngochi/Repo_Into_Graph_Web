import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/authApi';
import { useAppStore } from '../../../store/useAppStore';

export const useCheckHealth = () => {
  const showToast = useAppStore((state) => state.showToast);

  return useMutation({
    mutationFn: (serverUrl: string) => authApi.checkHealth(serverUrl),
    onSuccess: () => {
      showToast("Kết nối thành công!", "success");
    },
    onError: (error: any) => {
      // If it's a 404, it might mean the endpoint doesn't exist yet but server is up
      if (error.response?.status === 404) {
        showToast("Chưa có API check health", "error");
      } else {
        showToast("Không thể kết nối đến server.", "error");
      }
    },
  });
};
