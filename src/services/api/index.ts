import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'https://dead.uz/api2',
  withCredentials: true,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (config) => {
    return config;
  },
  (error) => {
    // Log errors only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    throw error;
  }
);

export default http;

export const endpoints = {
  user: {
    byId: (userId: string) => `/users/${userId}`,
    latestSubmission: () => `/user-plans`,
    mySubmissions: () => `/ielts-writing-submission/my-submissions`,
  },
  auth: {
    me: "/auth/me",
    verify_phone_otp: "/auth/verify-phone-otp",
    send_otp_code: "/auth/otp/phone",
    sign_up_phone: "/auth/signup-phone",
    sign_in_phone: "/users/login",
    sign_in_with_email: "/auth/signin-email",
    sign_up_with_email: "/auth/signup-email",
    sign_in_with_google: "/auth/google/callback",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
};
