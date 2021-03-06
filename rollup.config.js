import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const pkg = require('./package.json')

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
        plugins: [terser()],
      },
    ],
    external: [...Object.keys(pkg.devDependencies), 'vue'],
    plugins: [commonjs(), resolve()],
  },
]
