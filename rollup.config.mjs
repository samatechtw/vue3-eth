import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import nodePolyfills from 'rollup-plugin-polyfill-node'

import pkg from './package.json' assert { type: 'json' }

export default [
  {
    input: 'dist/index.js',
    output: [
      {
        exports: 'named',
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        plugins: [terser()],
      },
      {
        exports: 'named',
        file: pkg.module,
        sourcemap: true,
        plugins: [terser(), nodePolyfills({ include: ['zlib'] })],
      },
    ],
    external: [...Object.keys(pkg.devDependencies), 'vue'],
    plugins: [commonjs(), resolve()],
  },
]
