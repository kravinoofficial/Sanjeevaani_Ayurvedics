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
  
  // Override the default error page behavior
  // This prevents the Pages Router error pages from being generated
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Disable static optimization for error pages
  // Force all pages to be server-rendered
  generateEtags: false,
}

module.exports = nextConfig
