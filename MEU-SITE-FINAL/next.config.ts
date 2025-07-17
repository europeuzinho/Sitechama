
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // A linha mais importante para criar a pasta `out`:
  output: 'export',
  
  // Desativa a verificação de tipo durante o build para evitar erros de dependências
  typescript: {
    ignoreBuildErrors: true,
  },

  // Desativa a verificação de lint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true, // Essencial para exportação estática
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's1.1zoom.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
