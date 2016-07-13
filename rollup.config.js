import buble from 'rollup-plugin-buble';

export default {
  entry: './src/index.js',
  format: 'umd',
  moduleName: 'GeminiScrollbar',
  plugins: [buble()],
  dest: './lib/index.js'
};
