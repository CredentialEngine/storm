var path = require('path');
var webpack = require('webpack')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
           'style-loader',
           'css-loader'
         ]
       }, {
                // Exposes jQuery for use outside Webpack build
                test: require.resolve('jquery'),
                use: [{
                    loader: 'expose-loader',
                    options: 'jQuery'
        }, {
                    loader: 'expose-loader',
                    options: '$'
        }]
      }
     ]
    },
    plugins: [
    // Provides jQuery for other JS bundled with Webpack
    new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
    // Provides jQuery for other JS bundled with Webpack
    new webpack.ProvidePlugin({
            xml2js: 'xml2js'
        })
  ]
};
