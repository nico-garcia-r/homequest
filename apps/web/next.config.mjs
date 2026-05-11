/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@homequest/shared-types'],
  // Required for Docker: bundles server + deps into .next/standalone
  output: 'standalone',
};

export default nextConfig;
