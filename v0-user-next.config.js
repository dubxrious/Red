/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rihqmooghbklkdchzzgm.supabase.co",
      },
      {
        protocol: "https",
        hostname: "redseaquest.s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "q4d5fee3bhult8ls.public.blob.vercel-storage.com",
      },
    ],
  },
  // Remove the pageExtensions setting that's causing issues
  // pageExtensions: ["tsx", "ts", "jsx", "js"].map((ext) => `page.${ext}`),
}

module.exports = nextConfig

