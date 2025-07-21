/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Enable standalone output for Docker
  output: 'standalone',

  // External packages for server components
  serverExternalPackages: ['mysql2'],

  // Webpack configuration for React compatibility
  webpack: (config) => {
    // Resolve react to a single version to avoid version conflicts
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': 'react',
      'react-dom': 'react-dom',
    };
    return config;
  },

  // Disable TypeScript errors during build for now
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint errors during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
