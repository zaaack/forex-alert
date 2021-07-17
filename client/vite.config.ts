import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import externalGlobals from 'rollup-plugin-external-globals'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    outDir: '../static/',
    minify: 'esbuild',
    rollupOptions: {
      plugins: [
        //NOTE: https://github.com/vitejs/vite/issues/3001
        // vite 中使用 rollup 的 externals/globals 有bug, 所以直接用插件比较好
        externalGlobals({
          formiojs: 'Formio',
          react: 'React',
          'react-dom': 'ReactDOM',
        }),
      ],
    },
  },
  resolve: {
    alias: {
      //  https://github.com/vitejs/vite/issues/3399
      i18next: 'i18next/dist/cjs/i18next.js',
      moment: 'moment/min/moment.min.js',
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
