var path = require('path'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    PathRewriter = require('webpack-path-rewriter'),
    TapWebpackPlugin = require('tap-webpack-plugin'),
    SwPrecache = require('sw-precache-webpack-plugin')

var env = process.env, opts = {
  dstDir: env.DST_DIR || path.join(__dirname, '_dist'),
  dev: strToBool(env.DEV, true),
  livereload: strToBool(env.LIVERELOAD, false),
  hot: process.argv.indexOf('--hot') !== -1,
  hash: strToBool(env.HASH, false),
  uglify: strToBool(env.UGLIFY, false),
  port: env.PORT || '8080'
}

var cssCommonExtractor = new ExtractTextPlugin(
  opts.hash ? 'common-[contenthash].css' : 'common-dev.css',
  { allChunks: true }
)

var cssAppExtractor = new ExtractTextPlugin(
  opts.hash ? 'app-[contenthash].css' : 'app-dev.css',
  { allChunks: true }
)

module.exports = [{
  entry: {
    app: skipFalsy([
      opts.hot && 'webpack/hot/dev-server',
      'babel-polyfill',
      './src'
    ])
  },
  output: {
    path: opts.dstDir,
    filename: opts.hash ? '[name]-[chunkhash].js' : '[name]-dev.js',
    pathinfo: opts.dev
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx'],
    root: path.resolve(__dirname, 'src'),
    fallback: [ __dirname ]
  },
  devtool: opts.dev ? 'cheap-module-eval-source-map' : 'source-map',
  devServer: {
    historyApiFallback: true
  },
  debug: opts.dev,
  module: {
    preLoaders: [
      { test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      }
    ],
    loaders: [
      { test: /\.jsx?$/,
        exclude: /(node_modules[\\/]|test[\\/])/,
        loader: 'babel-loader'
      },
      { test: /[\\/]styles[\\/]common[\\/].*[.]scss$/,
        loader: styleLoader('css?-mergeIdents&-mergeRules&-uniqueSelectors!sass', cssCommonExtractor)
      },
      { test: /[\\/]styles[\\/]helvetica[\\/].*[.]scss$/,
        loader: styleLoader('css?-mergeIdents&-mergeRules&-uniqueSelectors!sass', cssAppExtractor)
      },
      { test: /[.]html$/,
        loader: PathRewriter.rewriteAndEmit({
          name: '[path][name].html'
        })
      },
      { test: /[.]jade$/,
        loader: PathRewriter.rewriteAndEmit({
          name: '[path][name].html',
          loader: 'jade-html?' + JSON.stringify({ pretty: true, opts: opts })
        })
      },
      { test: /[\\/]assets[\\/]fonts[\\/]fontawesome[^/]*$/i,
        loader: 'file?name=[path][name].[ext]'
      },
      { test: /photoswipe.+\.(png|svg|gif)$/,
        loader: 'file?name=assets/images/photoswipe/' + (opts.hash ? '[name]-[hash].[ext]' : '[name]-dev.[ext]')
      },
      { test: /[\\/]assets[\\/]/,
        exclude: /[\\/]fonts[\\/]fontawesome[^/]*$/i,
        loader: 'file?name=' + (opts.hash ? '[path][name]-[hash].[ext]' : '[path][name]-dev.[ext]')
      }
    ]
  },
  plugins: skipFalsy([
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /(?:en|ru)[.]js/),

    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"'
    }),

    new webpack.optimize.OccurenceOrderPlugin(),

    cssCommonExtractor,
    cssAppExtractor,

    new PathRewriter({
      includeHash: opts.livereload,
      emitStats: false,
      silent: false
    }),

    opts.uglify && new webpack.optimize.UglifyJsPlugin(),

    opts.dev ? false : new SwPrecache({
      minify: true,
      stripPrefix: '_dist/',
    }),
  ])
},
//test build config
{
  entry: {
    test: './test',
  },
  output: {
    path: opts.dstDir,
    filename: '[name].js',
    pathinfo: opts.dev
  },
  resolve: {
    extensions: ['', '.js', '.json', '.jsx'],
    root: path.resolve(__dirname, 'src'),
    fallback: [ __dirname ],
    alias: {
      'react/lib/ReactContext': 'moment'
    }
  },
  target: 'node',
  node: {
    fs: 'empty',
  },
  devtool: 'inline-source-map',
  debug: opts.dev,
  module: {
    preLoaders: [
      { test: /\.jsx?$/,
        loader: 'eslint-loader'
      }
    ],
    loaders: [
      { test: /\.jsx?$/,
        exclude: /node_modules[\\/]/,
        loader: 'babel-loader'
      },
      { test: /[\\/]styles[\\/]common[\\/].*[.]scss$/,
        loader: styleLoader('css?-mergeIdents&-mergeRules&-uniqueSelectors!sass', cssCommonExtractor)
      },
      { test: /[\\/]styles[\\/]helvetica[\\/].*[.]scss$/,
        loader: styleLoader('css?-mergeIdents&-mergeRules&-uniqueSelectors!sass', cssAppExtractor)
      },
      { test: /[.]html$/,
        loader: PathRewriter.rewriteAndEmit({
          name: '[path][name].html'
        })
      },
      { test: /[.]jade$/,
        loader: PathRewriter.rewriteAndEmit({
          name: '[path][name].html',
          loader: 'jade-html?' + JSON.stringify({ pretty: true, opts: opts })
        })
      },
      { test: /[\\/]assets[\\/]fonts[\\/]fontawesome[^/]*$/i,
        loader: 'file?name=[path][name].[ext]'
      },
      { test: /[\\/]assets[\\/]/,
        exclude: /[\\/]fonts[\\/]fontawesome[^/]*$/i,
        loader: 'file?name=' + (opts.hash ? '[path][name]-[hash].[ext]' : '[path][name]-dev.[ext]')
      },
      { test: /photoswipe.+\.(png|svg|gif)$/,
        loader: 'file?name=assets/images/photoswipe/' + (opts.hash ? '[name]-[hash].[ext]' : '[name]-dev.[ext]')
      },
      {
        test: /node_modules[\\/].*\.json$/,
        loader: 'raw'
      }
    ]
  },
  plugins: skipFalsy([
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /(?:en|ru)[.]js/),

    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"'
    }),

    new PathRewriter({
      includeHash: opts.livereload,
      emitStats: false,
      silent: false
    }),

    new TapWebpackPlugin(),
  ])
},
]


function styleLoader(loader, extractor) {
  return opts.hot
    ? addSourceMapArg('style!' + loader)
    : extractor.extract(addSourceMapArg(loader))
}


function addSourceMapArg(loader) {
  return loader
    .split('!')
    .map(function(l) { return l.indexOf('?') == -1 ? l + '?sourceMap' : l + '&sourceMap' })
    .join('!')
}


function strToBool(val, def) {
  if (val === undefined)
    return def
  val = val.toLowerCase()
  return val === '1' || val === 'true' || val === 'yes' || val === 'y'
}


function skipFalsy(array) {
  return array.filter(function(item) { return !!item })
}
