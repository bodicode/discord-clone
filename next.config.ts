import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });

    return config;
  },
  images: {
    domains: ["l2kw9n6neu.ufs.sh"],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
