import babel from 'rollup-plugin-babel';

var pkg = require('./package.json');

export default {
  entry: 'src/index.js',
  plugins: [
    babel({
      presets: [
        [
          'es2015',
          {
            modules: false,
          },
        ],
      ],
      plugins: ['external-helpers'],
      exclude: ['node_modules/**'],
    }),
  ],
  targets: [
    {
      format: 'cjs',
      dest: pkg['browser'],
    },
  ],
};
