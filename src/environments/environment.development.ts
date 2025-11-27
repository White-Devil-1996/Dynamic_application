export const environment = {
  production: false,
  apiBaseUrl: 'https://api.your-backend.com', // dev API
  // Short idle timeout for development/testing
  idleTimeoutMs: 30 * 1000, // 30 seconds
  // Pre-warning before final logout (milliseconds)
  idlePrewarnMs: 10 * 1000, // 10 seconds
};
