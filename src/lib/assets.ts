const DEFAULT_ASSET_BASE = 'https://r2.jseds.com';

export function assetUrl(path: string) {
  const base = (import.meta.env.PUBLIC_ASSET_BASE_URL || DEFAULT_ASSET_BASE).replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
