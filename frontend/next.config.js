/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "blob.vercel-storage.com"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/local_bucket/**",
      },
      {
        protocol: "https",
        hostname: "blob.vercel-storage.com",
        pathname: "/**",
      },
      ...(process.env.NEXT_BLOB_STORAGE_PUBLIC_URL
        ? [
            {
              protocol: "https",
              hostname: process.env.NEXT_BLOB_STORAGE_PUBLIC_URL,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

module.exports = nextConfig;
