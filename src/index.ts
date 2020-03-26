// const pluginName = 'QiankunDevConfigPlugin';

import webpack, { Compiler } from 'webpack'
import assert from 'assert';


export interface QiankunDevOption {
    appName?: string,
    allowedHosts?: string[]
}
class QiankunDevConfigPlugin {

    options: QiankunDevOption;

    constructor(options: QiankunDevOption | undefined = {}) {
        this.options = options
    }
    apply(compiler: Compiler) {

        compiler.hooks.environment.tap('QiankunDevConfigPlugin', () => {

            assert(this.options.appName, 'Need config \'appName\' for this plugin');
            const { appName } = this.options;
            compiler.options.output!.libraryTarget = 'umd';
            compiler.options.output!.library = `qinakun-app-${appName}`;
            compiler.options.output!.jsonpFunction = `webpackJsonp_${appName}`;



            if (!compiler.options.devServer) {
                compiler.options.devServer = {}
            }
            const devServer = compiler.options.devServer;

            const port = process.env.PORT || devServer.port;
            const protocol = (process.env.HTTPS || devServer.https) ? 'https:' : 'http:'
            const host = devServer.host;

            // 配置 publicPath，支持 hot update
            if (process.env.NODE_ENV === 'development' && port) {
                compiler.options.output!.publicPath = `${protocol}//${host}:${port}/`;
            }

            if (!devServer.headers) {
                devServer.headers = {}
            }
            Object.assign(devServer.headers, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
            })

            if (process.env.NODE_ENV === 'development' && port) {
                console.warn('如果master应用的页面，子应用的websocket连接不上，请配置 devServer.allowedHosts')
            }

            // if (!devServer.allowedHosts) {
            //     assert(this.options.allowedHosts, 'need config devServer.allowedHosts or config allowedHosts for this plugin')
            //     // devServer.allowedHosts = this.options.allowedHosts || [];
            // }

            // source-map 跨域设置
            if (process.env.NODE_ENV === 'development' && port) {
                // 变更 webpack-dev-server websocket 默认监听地址
                // process.env.SOCKET_SERVER = `${protocol}//${host}:${port}/`;

                // 禁用 devtool，启用 SourceMapDevToolPlugin
                compiler.options.output!.devtoolNamespace = `qinakun-app-${appName}`
                compiler.options.devtool = false;

                new webpack.SourceMapDevToolPlugin(
                    {
                        //@ts-ignore maybe deprecated
                        namespace: `qinakun-app-${appName}`,
                        append: `\n//# sourceMappingURL=${protocol}//${host}:${port}/[url]`,
                        filename: '[file].map',
                    },
                ).apply(compiler)


            }
        })
    }
}

// export default QiankunDevConfigPlugin
module.exports = QiankunDevConfigPlugin