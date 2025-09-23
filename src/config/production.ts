export const productionConfig = {
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || 'https://your-production-api.com',
    timeout: 30000,
  },
  features: {
    analytics: process.env.VITE_ENABLE_ANALYTICS === 'true',
    errorReporting: process.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    serviceWorker: process.env.VITE_ENABLE_SERVICE_WORKER === 'true',
  },
  performance: {
    enableChunking: true,
    enableCompression: true,
    enableCaching: true,
  },
};
