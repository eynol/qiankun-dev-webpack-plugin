
const HtmlWebpakcPlugin = require('html-webpack-plugin')
const path = require('path');

const QiankunPlugin = require('../../lib/index')
console.log(QiankunPlugin)

module.exports = {
    entry: './index.js',
    output: {
        library: `app-[name]`,
        libraryTarget: 'umd',
    },
    plugins: [
        new HtmlWebpakcPlugin({
        }),
        new QiankunPlugin({
            appName: 'app1',
           
        })
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