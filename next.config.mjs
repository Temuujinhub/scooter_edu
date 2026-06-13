/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Зураг — энэ MVP-д бид SVG/локал зураг ашиглах тул гадаад домэйн шаардлагагүй.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
