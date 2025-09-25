import { useEffect, useMemo, useState } from 'react';

type Props = {
  desktopUrl: string;
  mobileUrl: string;
  className?: string;
};

export default function AppBackground({ desktopUrl, mobileUrl, className }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mq = window.matchMedia('(max-width: 640px)');

    const apply = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    const handleChange = (event: MediaQueryListEvent) => apply(event);

    apply(mq);
    mq.addEventListener?.('change', handleChange);
    mq.addListener?.(handleChange);

    return () => {
      mq.removeEventListener?.('change', handleChange);
      mq.removeListener?.(handleChange);
    };
  }, []);

  const url = useMemo(
    () => (isMobile ? mobileUrl : desktopUrl),
    [isMobile, desktopUrl, mobileUrl],
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const targets: HTMLElement[] = [document.documentElement, document.body];
    const value = `url(${url})`;
    const attachment = isMobile ? 'scroll' : 'fixed';

    targets.forEach((el) => {
      el.style.backgroundImage = value;
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundAttachment = attachment;
    });

    return () => {
      targets.forEach((el) => {
        el.style.backgroundImage = '';
        el.style.backgroundRepeat = '';
        el.style.backgroundSize = '';
        el.style.backgroundPosition = '';
        el.style.backgroundAttachment = '';
      });
    };
  }, [url, isMobile]);

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        backgroundImage: `url(${url})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: isMobile ? 'scroll' : 'fixed',
      }}
    />
  );
}