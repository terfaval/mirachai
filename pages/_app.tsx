import type { AppProps } from 'next/app';
import { useEffect, useMemo, useState } from 'react';
import AppBackground from '@/components/AppBackground';
import '../styles/globals.css';
import '@/styles/pager-global.css';

const resolveBackgroundSuffix = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'evening';
  return 'night';
};

export default function MyApp({ Component, pageProps }: AppProps) {
  const [backgroundSuffix, setBackgroundSuffix] = useState<string>('night');

  useEffect(() => {
    const apply = () => setBackgroundSuffix(resolveBackgroundSuffix());
    apply();
    const interval = window.setInterval(apply, 60 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  const desktopUrl = useMemo(
    () => `/desktop_background/desktop_background_${backgroundSuffix}.png`,
    [backgroundSuffix],
  );

  return (
    <>
      <AppBackground
        className="app-bg-fixed"
        desktopUrl={desktopUrl}
        mobileUrl="/mobile_background/mobile_background.png"
      />
      <Component {...pageProps} />
    </>
  );
}