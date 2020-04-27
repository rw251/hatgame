import copy from 'rollup-plugin-copy'
import rimraf from 'rimraf';
import { join } from 'path';
import { terser } from 'rollup-plugin-terser';
import rollbarDeploy from 'rollup-plugin-rollbar-deploy';
import rollbarSourcemaps from 'rollup-plugin-rollbar-sourcemaps';
import { execSync } from 'child_process';
import createHTMLPlugin from './lib/create-html';
import { version } from './package.json';

require('dotenv').config()

const rollbarClientToken = process.env.ROLLBAR_CLIENT_TOKEN;
const rollbarServerToken = process.env.ROLLBAR_SERVER_TOKEN;

const SOURCE_VERSION = process.env.SOURCE_VERSION || execSync('git rev-parse --short HEAD').toString();
const USER = execSync('whoami').toString();

const distDir = join('public_html');
// Remove ./dist
rimraf.sync(distDir);

function buildConfig({ watch, isProduction } = {}) {
  const isDev = watch;

  return {
    input: {
      main: 'src/client/index.js',
    },
    output: {
      dir: distDir,
      format: 'iife',
      sourcemap: watch || 'hidden',
      entryFileNames: '[name]-[hash].js',
      chunkFileNames: '[name]-[hash].js',
    },
    watch: { clearScreen: false },
    plugins: [
      // resolves in-built node packages like https / fs etc..
      // nodeResolve({
      //   preferBuiltins: true,
      //   mainFields: ['browser', 'module', 'main'],
      // }),

      // commonjs(), // allows import to work with commonjs modules that do a module.exports
      // globals(),
      // builtins(),
      // babel({ exclude: 'node_modules/**' }),
      !isDev && terser(), // uglify the code if not dev mode
      createHTMLPlugin({ isDev, rollbarClientToken }), // create the index.html
      copy({
        targets: [
          { src: 'src/client/static/*', dest: distDir, dot: true },
        ],
      }),
      // createServiceWorkerPlugin(),
      // createNumberSolverWorkerPlugin(),
      isProduction && rollbarSourcemaps({
        accessToken: rollbarServerToken,
        baseUrl: '//inthehat.herokuapp.com/',
        version,
      }), // upload rollbar source maps if production build
      isProduction && rollbarDeploy({
        accessToken: rollbarServerToken,
        revision: SOURCE_VERSION,
        environment: 'production',
        localUsername: USER,
      }), // notify Rollbar of a deployment if production build
    ].filter(item => item), // filter out unused plugins by filtering out false and null values
  };
}

export default function ({ watch }) {
  return [
    buildConfig({ watch, isProduction: !!process.env.PRODUCTION }),
  ];
}
