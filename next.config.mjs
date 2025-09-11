// next.config.mjs
/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true }, // ✅ ne fusson ESLint a buildben/Vercelen
  // egyéb beállítások...
};
