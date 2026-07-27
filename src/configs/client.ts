import axios from "axios";

// Lấy base URL từ biến môi trường của Vite (.env)
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5246";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptors nếu cần thiết
apiClient.interceptors.request.use(
  (config) => {
    // Ví dụ: đính kèm token vào header
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data trực tiếp cho dễ dùng
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);
