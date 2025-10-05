const CSRF_COOKIE_NAME = "csrfToken";

export const getCsrfToken = () => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return "";
};

export const attachCsrfInterceptor = (axiosInstance) => {
  if (!axiosInstance || typeof axiosInstance.interceptors !== "object") {
    return;
  }

  axiosInstance.interceptors.request.use((config) => {
    const method = typeof config?.method === "string" ? config.method.toLowerCase() : "get";
    if (["post", "put", "patch", "delete"].includes(method)) {
      const token = getCsrfToken();
      if (token) {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers["X-CSRF-Token"] = token;
      }
    }
    return config;
  });
};

const csrfService = {
  getCsrfToken,
  attachCsrfInterceptor,
};

export default csrfService;
