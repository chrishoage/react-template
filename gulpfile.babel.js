import gulp from 'gulp'
import fs from 'fs'
import path from 'path'
import gulpif from 'gulp-if'
import gutil from 'gulp-util'
import del from 'del'
import runSequence from 'run-sequence'
import eslint from 'gulp-eslint'
import webpack from 'webpack'
import WebpackServer from 'webpack-dev-server'
import merge from 'lodash.merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const {
  NODE_ENV = 'production',
  HOST = 'localhost',
  PORT = 9000
} = process.env

const isProd = NODE_ENV === 'production'

const fullPath = (...paths) => path.join(__dirname, ...paths)

const deepMergeClone = (...sources) => merge({}, ...sources, (a, b) => {
  if (Array.isArray(a)) {
    return b.concat(a)
  }
})

const paths = {
  src:   ['./src/**', '!./src/js{,/**}', '!./src/scss{,/**}'],
  js:    './src/js',
  scss:  './src/scss',
  entry: './src/js/app.js',
  output: 'assets',
  dist:   './dist'
}

function generateWebpackConfig(env) {

  const webpackBaseConfig = {
    entry: [paths.entry],
    output: {
      path: fullPath(paths.dist, paths.output),
      filename: 'bundle.js',
      pathinfo: !isProd
    },
    module: {
      loaders: [{
        test: /.js?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: ['babel?stage=0&optional[]=runtime'],
        include: fullPath(paths.js)
      }, {
        test: /.json$/,
        loader: 'json'
      }]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(NODE_ENV)
        }
      }),
      new webpack.NoErrorsPlugin()
    ],
    resolve: {
      root: fullPath(paths.js),
      extensions: ['', '.js', '.json']
    }
  }

  switch (env) {
    case 'development':
      const webpackDevConfig = deepMergeClone(webpackBaseConfig, {
        devtool: 'eval-source-map',
        debug: true,
        entry: [`webpack-dev-server/client?http://${HOST}:${PORT}`, 'webpack/hot/only-dev-server'],
        output: {
          publicPath: `http://${HOST}:${PORT}/assets/`
        },
        plugins: [new webpack.HotModuleReplacementPlugin()],
        module: {
          loaders: [
            {
              test: /.js?$/,
              loader: 'react-hot'
            },
            {
              test: /\.scss$/,
              loader: 'style!css!autoprefixer!sass?includePaths[]=' + fullPath(paths.scss)
            }
          ]
        }
      })
      return webpackDevConfig
    case 'production':
    default:
      const webpackProdConfig = deepMergeClone(webpackBaseConfig, {
        plugins: [
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin(),
          new ExtractTextPlugin('styles.css')
        ],
        module: {
          loaders: [
            {
              test: /\.scss$/,
              loader: ExtractTextPlugin.extract('css!autoprefixer!sass?includePaths[]=' + fullPath(paths.scss))
            }
          ]
        }
      })
      return webpackProdConfig
  }
}

const webpackConfig = generateWebpackConfig(NODE_ENV)

gulp.task('clean', (callback) => {
  del([
    paths.dist
  ], callback)
})

gulp.task('copy', () => {
  return gulp.src(paths.src)
             .pipe(gulp.dest(paths.dist))
             .on('error', gutil.log)
})

gulp.task('lint', () => {
  return gulp.src(paths.js)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(gulpif(isProd, eslint.failOnError()))
})

gulp.task('webpack', (callback) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) throw new gutil.PluginError('webpack', err)
    gutil.log('[webpack]', stats.toString({colors: false}))
    callback()
  })
})

gulp.task('dev-server', () => {
  new WebpackServer(webpack(webpackConfig), {
    publicPath: `/${paths.output}/`,
    contentBase: fullPath(paths.dist),
    inline: true,
    hot: !isProd,
    stats: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': `http://${HOST}:${PORT}`,
      'Access-Control-Allow-Headers': 'X-Requested-With'
    }
  }).listen(PORT, 'localhost', (err) => {
    if (err) throw new gutil.PluginError('webpack', err)
    gutil.log('[dev]', `Open http://${HOST}:${PORT}/`)
  })
})

gulp.task('watch', () => {
  gulp.watch(paths.js, ['lint'])
  gulp.watch('./src/**/*.{html,png,jpeg,jpg,json}', ['copy'])
})

gulp.task('prepare', function(callback) {
  runSequence('clean', 'copy', callback)
})

gulp.task('build', ['prepare', 'lint'])

gulp.task('dev', function(callback) {
  runSequence('build', 'dev-server', 'watch', callback)
})

gulp.task('default', (callback) => {
  runSequence('build', 'webpack', callback)
})