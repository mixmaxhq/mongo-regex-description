/* jshint node:true */
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import rootImport from 'rollup-plugin-root-import';

var pkg = require('./package.json');

export default {
  entry: 'src/index.js',
  plugins: [
    rootImport({
      root: `${__dirname}/src/common`,
      useEntry: 'prepend',
      // Because we omit the .js most of the time, we put it first, and explicitly specify that it
      // should attempt the lack of extension only after it tries to resolve with the extension.
      extensions: ['.js', '']
    }),
    nodeResolve(),
    commonjs({
      include: ['node_modules/**', 'src/common/**'],
      // laze fails https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module
      // for some reason.
      namedExports: {
        'laze': ['defineAll']
      }
    }),
    babel({
      presets: [
        [
          'es2015', {
            modules: false
          }
        ]
      ],
      plugins: [
        'external-helpers'
      ],
      exclude: ['node_modules/**']
    })
  ],
  targets: [{
    format: 'cjs',
    dest: pkg['browser']
  }]
};