import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maas-watermark-prod-new.cn-wlcb.ufileos.com",
      },
      {
        protocol: "https",
        hostname: "**.ufileos.com",
      },
      // 智谱 GLM CogView 生成的图片
      {
        protocol: "https",
        hostname: "**.bigmodel.cn",
      },
      {
        protocol: "https",
        hostname: "**.sfilechatglm.cn",
      },
    ],
  },
};

export default nextConfig;
