import "@/styles/globals.css";
import "@/styles/animations.css";
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/react';
import axios from 'axios';
import { AppProps } from 'next/app';
import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Set default timeout to prevent hanging requests
axios.defaults.timeout = 15000;

// Configure axios to handle circular references globally
axios.interceptors.request.use((config: any) => {
  if (!config.transformRequest) {
    config.transformRequest = [(data: any, headers?: any) => {
      if (data && typeof data === 'object') {
        try {
          const seen = new WeakSet();
          const replacer = (key: string, value: any) => {
            if (key.startsWith('__react') || key === 'stateNode') return undefined;
            if (
              typeof window !== 'undefined' && (
                (typeof Element !== 'undefined' && value instanceof Element) ||
                (typeof SVGElement !== 'undefined' && value instanceof SVGElement) ||
                (typeof value === 'object' && value !== null && value.$$typeof)
              )
            ) return '[ReactElement]';
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) return undefined;
              seen.add(value);
            }
            return value;
          };
          return JSON.stringify(data, replacer);
        } catch (err) {
          return data;
        }
      }
      return data;
    }];
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  (error: any) => Promise.reject(error)
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Component {...pageProps} />
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
