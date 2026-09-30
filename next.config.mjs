/** @type {import('next').NextConfig} */
const suffix = process.env.BASE44_PUBLIC_HOST_SUFFIX || '';

const nextConfig = {
  allowedDevOrigins: suffix ? [`3000-${suffix}`] : [],
};

export default nextConfig;
