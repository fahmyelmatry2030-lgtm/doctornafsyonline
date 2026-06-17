import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Limit CPU and memory usage during build to prevent Hostinger 503 errors (CloudLinux LVE limits)
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: false,
  },
};

export default nextConfig;
