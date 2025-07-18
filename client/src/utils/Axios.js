import axios from "axios";
import SummaryApi from "../common/SummaryApi";

const Axios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // e.g. http://localhost:5000/api
  withCredentials: true, // ✅ send cookies like accessToken
});

// 👉 Attach access token to every request
Axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accesstoken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 errors and refresh token flow
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 and prevent infinite retry loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // 🔁 Refresh access token
        const res = await axios({
          ...SummaryApi.refreshToken,
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
          withCredentials: true, // ✅ make sure cookies work
        });

        const newAccessToken = res?.data?.data?.accessToken;
        if (newAccessToken) {
          localStorage.setItem("accesstoken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return Axios(originalRequest); // 🔁 Retry failed request
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
        // Optionally: logout user or redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default Axios;

