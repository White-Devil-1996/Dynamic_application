export const environment = {
  // During local development the app uses this file. Set to `false` so
  // development-only debug logging is enabled inside services.
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  // Short idle timeout for local testing
  idleTimeoutMs: 30 * 1000, // 30 seconds
  // Pre-warning before final logout (milliseconds)
  idlePrewarnMs: 10 * 1000, // 10 seconds
};
