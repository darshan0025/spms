import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["imagekit", "pg", "bcryptjs"],
};

export default nextConfig;
