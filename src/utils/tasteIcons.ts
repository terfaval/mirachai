const TASTE_ICON_MAP: Record<string, string> = {
  bottle: '/tastes/icon_bottle.svg',
  csipos: '/tastes/icon_csipos.svg',
  edes: '/tastes/icon_edes.svg',
  foldes: '/tastes/icon_foldes.svg',
  friss: '/tastes/icon_friss.svg',
  fuszeres: '/tastes/icon_fuszeres.svg',
  gyumolcsos: '/tastes/icon_gyumolcsos.svg',
  keseru: '/tastes/icon_keseru.svg',
  savanyu: '/tastes/icon_savanyu.svg',
  umami: '/tastes/icon_umami.svg',
  viragos: '/tastes/icon_viragos.svg',
};

export function getTasteIcon(slug: string): string {
  const key = slug.replace(/-/g, '_');
  return TASTE_ICON_MAP[key] ?? '/icons/icon_taste.svg';
}