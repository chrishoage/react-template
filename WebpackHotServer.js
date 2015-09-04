import path from 'path'
import express from 'express'

const defaultOptions = {
  hot: false,
  stats: false,
  publicPath: '/',
  contentBase: __dirname
}

export default function WebpackHotServer(compiler, options = defaultOptions) {
  const app = express()

  app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: !options.stats,
      publicPath: options.publicPath
  }))

  if (options.hot) {
    app.use(require('webpack-hot-middleware')(compiler))
  }

  app.use(express.static(options.contentBase))

  return app

}

