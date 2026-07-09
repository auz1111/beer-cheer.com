import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function unityGzipHeadersPlugin() {
  return {
    name: 'unity-gzip-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        const pathname = url.split('?')[0]

        if (pathname.startsWith('/unity-build/')) {
          const publicPath = path.join(server.config.root, 'public', decodeURIComponent(pathname.replace(/^\//, '')))
          if (!fs.existsSync(publicPath)) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end('Not found')
            return
          }
        }

        if (url.includes('/unity-build/Build/') && url.endsWith('.gz')) {
          res.setHeader('Content-Encoding', 'gzip')
          if (url.endsWith('.wasm.gz')) {
            res.setHeader('Content-Type', 'application/wasm')
          } else if (url.endsWith('.js.gz')) {
            res.setHeader('Content-Type', 'application/javascript')
          } else if (url.endsWith('.data.gz')) {
            res.setHeader('Content-Type', 'application/octet-stream')
          }
        }
        if (url.includes('/unity-build/StreamingAssets/aa/')) {
          if (url.endsWith('.bundle') || url.endsWith('.bin')) {
            res.setHeader('Content-Type', 'application/octet-stream')
          } else if (url.endsWith('.hash')) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          } else if (url.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json')
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), unityGzipHeadersPlugin()],
  optimizeDeps: {
    exclude: ['quill'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://www.beer-cheer.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
