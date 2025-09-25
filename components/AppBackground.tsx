import { useEffect, useMemo, useState } from 'react';

type Props = {
  desktopUrl: string;
  mobileUrl: string;
  className?: string;
};

export default function AppBackground({ desktopUrl, mobileUrl, className }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [isViewportReady, setIsViewportReady] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const placeholderColor = 'var(--app-bg-placeholder, #21160f)';

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setIsViewportReady(true);
      return;
    }

    const mq = window.matchMedia('(max-width: 768px)');

    const apply = (event: MediaQueryList | MediaQueryListEvent) => {
      const matches = 'matches' in event ? event.matches : (event as MediaQueryList).matches;
      setIsMobile(matches);
    };

    apply(mq);
    setIsViewportReady(true);
    const handleChange = (event: MediaQueryListEvent) => apply(event);
    mq.addEventListener?.('change', handleChange);
    mq.addListener?.(handleChange);

    return () => {
      mq.removeEventListener?.('change', handleChange);
      mq.removeListener?.(handleChange);
    };
  }, []);

  const targetUrl = useMemo(
    () => (isMobile ? mobileUrl : desktopUrl),
    [isMobile, desktopUrl, mobileUrl],
  );

  useEffect(() => {
    if (!targetUrl || !isViewportReady) return;

    let cancelled = false;
    setDisplayUrl((current) => (current === targetUrl ? current : null));

    const img = new Image();
    const finish = () => {
      if (!cancelled) {
        setDisplayUrl(targetUrl);
      }
    };

    img.addEventListener('load', finish);
    img.addEventListener('error', finish);
    img.src = targetUrl;

    if (img.complete) {
      finish();
    }

    return () => {
      cancelled = true;
      img.removeEventListener('load', finish);
      img.removeEventListener('error', finish);
    };
  }, [isViewportReady, targetUrl]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const targets: HTMLElement[] = [document.documentElement, document.body];
    const attachment = isMobile ? 'scroll' : 'fixed';

    targets.forEach((el) => {
      if (displayUrl) {
        el.style.backgroundColor = '';
        el.style.backgroundImage = `url(${displayUrl})`;
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = isMobile ? '125%' : 'cover';
        el.style.backgroundPosition = 'center';
        el.style.backgroundAttachment = attachment;
      } else {
        el.style.backgroundColor = placeholderColor;
        el.style.backgroundImage = '';
        el.style.backgroundRepeat = '';
        el.style.backgroundSize = '';
        el.style.backgroundPosition = '';
        el.style.backgroundAttachment = '';
      }
    });

    return () => {
      targets.forEach((el) => {
        el.style.backgroundImage = '';
        el.style.backgroundRepeat = '';
        el.style.backgroundSize = '';
        el.style.backgroundPosition = '';
        el.style.backgroundAttachment = '';
        el.style.backgroundColor = '';
      });
    };
  }, [displayUrl, isMobile, placeholderColor]);

  const backgroundStyle = displayUrl
    ? {
        backgroundImage: `url(${displayUrl})`,
        backgroundRepeat: 'no-repeat' as const,
        backgroundSize: 'cover' as const,
        backgroundPosition: 'center' as const,
        backgroundAttachment: (isMobile ? 'scroll' : 'fixed') as 'scroll' | 'fixed',
      }
    : {
        backgroundImage: 'none',
        backgroundColor: placeholderColor,
      };

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        ...backgroundStyle,
      }}
    />
  );
}