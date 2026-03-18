import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["imagekit", "mysql2", "bcryptjs"],
};

export default nextConfig;
