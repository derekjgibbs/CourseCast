/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['convex'],
  webpack: (config, { isServer }) => {
    // Handle ES modules in convex generated files
    config.module.rules.push({
      test: /convex\/_generated.*\.js$/,
      type: 'javascript/auto',
    })
    
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    }
    
    return config
  }
}

module.exports = nextConfig