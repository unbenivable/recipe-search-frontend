import "@/styles/globals.css";
import { Analytics } from '@vercel/analytics/react';
import ThemeProvider from '@/components/ThemeProvider';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <div className="transition-colors duration-200 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <ThemeSwitcher />
        <Component {...pageProps} />
        <Analytics />
      </div>
    </ThemeProvider>
  );
}
