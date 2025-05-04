import "@/styles/globals.css";
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/react';
import axios from 'axios';

// Set default timeout to prevent hanging requests
axios.defaults.timeout = 15000; // 15 seconds timeout

// Configure axios to handle circular references globally
axios.interceptors.request.use((config) => {
  // Only transform if there's no transformRequest already defined
  if (!config.transformRequest) {
    config.transformRequest = [(data, headers) => {
      if (data && typeof data === 'object') {
        try {
          // Custom JSON.stringify with a replacer function to handle circular references
          const seen = new WeakSet();
          const replacer = (key, value) => {
            // Skip React-specific properties that might cause circular references
            if (key.startsWith('__react') || key === 'stateNode') {
              return undefined;
            }
            
            // Handle DOM nodes and React elements
            if (
              typeof window !== 'undefined' && (
                (typeof Element !== 'undefined' && value instanceof Element) || 
                (typeof SVGElement !== 'undefined' && value instanceof SVGElement) || 
                (typeof value === 'object' && value !== null && value.$$typeof)
              )
            ) {
              return '[ReactElement]';
            }
            
            // Handle other circular references
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return undefined;
              }
              seen.add(value);
            }
            return value;
          };
          
          return JSON.stringify(data, replacer);
        } catch (err) {
          console.error('Error in axios circular reference handler:', err);
          // If custom stringify fails, let axios handle it
          return data;
        }
      }
      return data;
    }];
  }
  return config;
});

// Add a response interceptor for better error handling
axios.interceptors.response.use(
  response => response, 
  error => {
    // Improve error messages for common issues
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        message: 'Unable to connect to the server. Please check your internet connection or the server might be down.'
      });
    }
    return Promise.reject(error);
  }
);

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <div className="transition-colors duration-200 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <Component {...pageProps} />
        <Analytics />
      </div>
    </ThemeProvider>
  );
}
