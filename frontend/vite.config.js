import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/register': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/registration-verification': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/forgot-password': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/reset-password': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/resend-otp-submit': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      // Data-only endpoints that conflict with frontend routes
      '/cart': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/products': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/categories': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/orders': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      },
      '/user': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/addresses': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/payment': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) {
            return '/index.html';
          }
        }
      }
    }
  }
})
