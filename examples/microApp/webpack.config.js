
const HtmlWebpakcPlugin = require('html-webpack-plugin')
const path = require('path');
const webpack = require('webpack')
const QiankunPlugin = require('../../lib/index')

module.exports = {
    // entry: ['./index.js', './index2.js'],
    entry: {
        app: './index.js',
        second: './index2.js',
    },
    output: {
        filename: '[name]-[hash].js',
        library: `app-[name]`,
        libraryTarget: 'umd',
    },
    mode: 'development',
    plugins: [
        new HtmlWebpakcPlugin({
            filename: 'app.html',
            chunks: ['app']
        }),
        new HtmlWebpakcPlugin({
            filename: 'app-2.html',
            chunks: ['second']
        }),
        new QiankunPlugin({
            appName: 'app1',

        }),
        new webpack.ProgressPlugin((percent, msg, proc, atvM, mname) => {
            console.log(percent, msg, proc, atvM, mname)
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        // hot: true,
        allowedHosts: ['app1.com']
        // compress: true,
        // port: 9000,
        // headers: {
        //     "Access-Control-Allow-Origin": "*",
        //     "Access-Control-Allow-Credentials": "true",
        //     "Access-Control-Allow-Headers": "Content-Type, Authorization, x-id, Content-Length, X-Requested-With",
        //     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
        // }

    }


}