import { useEffect, useState } from 'react';

export type TeaGridLayout = {
  tilesX: number;
  tilesY: number;
  perPage: number;
};

type LayoutPreset = {
  tilesX: number;
  tilesY: number;
};

const DESKTOP_BREAKPOINT = 1024;
const PHONE_BREAKPOINT = 640;

const DESKTOP_LAYOUT: LayoutPreset = { tilesX: 3, tilesY: 3 };
const TABLET_LAYOUT: LayoutPreset = { tilesX: 2, tilesY: 2 };
const PHONE_LAYOUT: LayoutPreset = { tilesX: 1, tilesY: 2 };

function withPerPage(preset: LayoutPreset): TeaGridLayout {
  return { ...preset, perPage: preset.tilesX * preset.tilesY };
}

export function resolveTeaGridLayout(width: number): TeaGridLayout {
  if (width <= PHONE_BREAKPOINT) return withPerPage(PHONE_LAYOUT);
  if (width <= DESKTOP_BREAKPOINT) return withPerPage(TABLET_LAYOUT);
  return withPerPage(DESKTOP_LAYOUT);
}

export function useTeaGridLayout(): TeaGridLayout {
  const [layout, setLayout] = useState<TeaGridLayout>(() => withPerPage(DESKTOP_LAYOUT));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateLayout = () => {
      const next = resolveTeaGridLayout(window.innerWidth);
      setLayout((prev) =>
        prev.tilesX === next.tilesX && prev.tilesY === next.tilesY ? prev : next,
      );
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);

    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return layout;
}