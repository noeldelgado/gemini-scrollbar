import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';

export default [
  {
    entry: 'src/index.js',
    dest: 'lib/index.umd.js',
    format: 'umd',
    moduleName: 'GeminiScrollbar',
    plugins: [
      resolve(),
      commonjs(),
      buble()
    ]
  },
  {
    entry: 'src/index.js',
    dest: 'lib/index.es.js',
    format: 'es',
    external: ['dpr-change']
  }
];
