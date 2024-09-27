import terser from '@rollup/plugin-terser'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import Vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

import pkg from './package.json' assert { type: 'json' }

const resolvePath = (p: string): string => path.resolve(__dirname, p)

const outputName = 'vue3-eth.mjs'

export default defineConfig({
  assetsInclude: /\.(pdf|jpg|png|webm|mp4|svg|wasm)$/,
  plugins: [
    nodePolyfills({ include: ['zlib', 'crypto', 'stream', 'util', 'buffer'] }),
    Vue(),
    dts({ rollupTypes: true }),
    terser(),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: true,
    lib: {
      formats: ['es'],
      entry: [resolvePath('./lib/index.ts')],
      name: '@samatech/vue3-eth',
      fileName: () => outputName,
    },
    rollupOptions: {
      external: [...Object.keys(pkg.devDependencies), 'vue'],
      output: {
        format: 'es',
        dir: 'dist',
      },
    },
  },
})
