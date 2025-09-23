import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import '@/styles/pager-global.css';

const USE_TIME_BASED_BACKGROUND = false;

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const setBackground = (url: string) => {
      const targets = [document.documentElement, document.body];
      targets.forEach((el) => {
        el.style.backgroundImage = url;
      });
    };

    if (USE_TIME_BASED_BACKGROUND) {
      const updateBackground = () => {
        const hour = new Date().getHours();
        let suffix = '';
        if (hour >= 5 && hour < 8) {
          suffix = 'dawn';
        } else if (hour >= 8 && hour < 11) {
          suffix = 'morning';
        } else if (hour >= 11 && hour < 14) {
          suffix = 'noon';
        } else if (hour >= 14 && hour < 17) {
          suffix = 'afternoon';
        } else if (hour >= 17 && hour < 20) {
          suffix = 'evening';
        } else {
          suffix = 'night';
        }
        setBackground(`url('/background_${suffix}.png')`);
      };

      updateBackground();
      const interval = setInterval(updateBackground, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }

    setBackground("url('/background_backup.png')");
  }, []);

  return (
    <>
      <Component {...pageProps} />
    </>
  );
}