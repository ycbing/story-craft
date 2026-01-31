import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maas-watermark-prod-new.cn-wlcb.ufileos.com",
      },
      // 如果使用其他图片服务，可以继续添加
      {
        protocol: "https",
        hostname: "**.ufileos.com",
      },
    ],
  },
};

export default nextConfig;
