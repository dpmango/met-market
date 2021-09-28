const path = require('path');
const { ESLINT_MODES, loaderByName, addBeforeLoader } = require('@craco/craco');

const alias = require('./src/config/aliases');

const SRC = './src';
const aliases = alias(SRC);

const resolvedAliases = Object.fromEntries(
  Object.entries(aliases).map(([key, value]) => [key, path.resolve(__dirname, value)])
);

module.exports = {
  webpack: {
    alias: resolvedAliases,
    configure: function (webpackConfig) {
      const svgLoader = {
        test: /\.svg$/i,
        oneOf: [
          {
            resourceQuery: /raw/,
            use: {
              loader: 'raw-loader',
              options: { esModule: false },
            },
          },
          {
            use: {
              loader: 'file-loader',
              options: { esModule: false },
            },
          },
        ],
      };

      addBeforeLoader(webpackConfig, loaderByName('file-loader'), svgLoader);

      return webpackConfig;
    },
  },
  eslint: {
    mode: ESLINT_MODES.file,
  },
  style: {
    sass: {
      loaderOptions: {
        sourceMap: true,
        additionalData: '@import "@styles/utilities";',
      },
    },
  },
};
