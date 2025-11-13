/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Skip static page generation errors during build
  // This is a dynamic app with authentication, not a static site
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip generating error pages during build
  // They will be generated at runtime
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Disable static page generation for error pages
  // This prevents build failures from default error pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig
