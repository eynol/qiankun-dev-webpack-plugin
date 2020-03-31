// const pluginName = 'QiankunDevConfigPlugin';

import webpack, { Compiler, /*Entry*/ } from 'webpack'
import path from 'path';
import fs from 'fs'
import HtmlWebpackPluginType from 'html-webpack-plugin'

const PLUGIN_NAME = 'QiankunDevPlugin';
export interface QiankunDevOption {
    appName?: string,
    entryRule?: (string) => boolean,
}

interface EntryPoint {
    name: string,
    id: string,
    chunks: Chunk[]
}
interface Chunk {
    files: string[]
}
// enum EntryType {
//     FILE,
//     FILE_ARR,
//     NAME_ARR
// }

const isFunction = (v:any): boolean => v instanceof Function

class QiankunDevConfigPlugin {

    options: QiankunDevOption;

    constructor(options: QiankunDevOption | undefined = {}) {
        this.options = options
    }
    apply(compiler: Compiler) {


        // get app name configuration 
        let appName: string;
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        if (this.options.appName) {
            appName = this.options.appName;
        } else if (fs.existsSync(pkgPath)) {
            try {
                let pkg = require(pkgPath)
                appName = pkg.name;
            } catch (e) {
                throw e
            }
        } else {
            throw new Error(pkgPath + 'is not exist, you can config appName for this plugin')
        }


        compiler.hooks.environment.tap(PLUGIN_NAME, () => {

            compiler.options.output!.libraryTarget = 'umd';
            compiler.options.output!.library = `${appName}-[name]`;
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

            // source-map 跨域设置
            if (process.env.NODE_ENV === 'development' && port) {
                // 变更 webpack-dev-server websocket 默认监听地址
                // process.env.SOCKET_SERVER = `${protocol}//${host}:${port}/`;

                // 禁用 devtool，启用 SourceMapDevToolPlugin
                compiler.options.output!.devtoolNamespace = `${appName}-[name]`
                compiler.options.devtool = false;

                new webpack.SourceMapDevToolPlugin(
                    {
                        //@ts-ignore maybe deprecated
                        namespace: `${appName}-[name]`,
                        append: `\n//# sourceMappingURL=${protocol}//${host}:${port}/[url]`,
                        filename: '[file].map',
                    },
                ).apply(compiler)


            }
        })

        modifyHtmlWebpackEntryProperty(compiler, this.options);


    }
}

function modifyHtmlWebpackEntryProperty(compiler: Compiler, options?: QiankunDevOption) {

    // Get HtmlWebpackPlugin Class
    const htmlWebpakcPlugin = compiler.options.plugins?.find(
        (plugin) => plugin.constructor.name === 'HtmlWebpackPlugin'
    );

    const HAS_HTML_WEBPACK_PLUGIN_ = !!htmlWebpakcPlugin;
    let HtmlWebpackPlugin: typeof HtmlWebpackPluginType;
    if (htmlWebpakcPlugin) {
        HtmlWebpackPlugin = htmlWebpakcPlugin.constructor as typeof HtmlWebpackPluginType
    }


    // Find all Webpack entries
    // let entryType: EntryType;
    // let entries: Entry | string | string[] | undefined;
    // if (typeof compiler.options.entry === 'function') {
    //     entries = await compiler.options.entry()
    // } else {
    //     entries = compiler.options.entry;
    // }

    // if (typeof entries === 'undefined') {
    //     throw new Error('entries is undefiend')
    // }

    // if (typeof entries === 'string') {
    //     entryType = EntryType.FILE;
    //     entries = ['main'];// webpack default
    // } else if (Array.isArray(entries)) {
    //     entryType = EntryType.FILE_ARR;
    //     entries = ['main']; // webpack default
    // } else {
    //     entryType = EntryType.NAME_ARR;
    // }

    // const HtmlWebpackPlugin: HtmlWebpackPluginType = require((join(compiler.context, 'node_modules', 'html-webpack-plugin'))).default;

    compiler.hooks.make.tap(PLUGIN_NAME, compilation => {
        let hooks: HtmlWebpackPluginType.Hooks;
        if (HAS_HTML_WEBPACK_PLUGIN_) {
            hooks = HtmlWebpackPlugin.getHooks(compilation)


            let chunkFiles: string[];
            const getAllEntryChunkFiles = () => {

                if (!chunkFiles) chunkFiles = [];

                for (let entryPoint of (compilation.entrypoints as Map<string, EntryPoint>).values()) {
                    entryPoint.chunks.forEach(chunk => {
                        chunkFiles = chunkFiles.concat(chunk.files)
                    })
                    // switch (entryType) {
                    //     case EntryType.FILE: {
                    //         break
                    //     }
                    //     case EntryType.FILE_ARR: {
                    //         break
                    //     }
                    //     case EntryType.NAME_ARR: {
                    //         break
                    //     }
                    // }
                    debugger
                }

                return chunkFiles;
            }

            // hooks.beforeEmit.tap(PLUGIN_NAME, ({ html, outputName, plugin }) => {
            //     // dugger
            //     return ({ html, outputName, plugin })
            // })



            hooks.alterAssetTags.tap(PLUGIN_NAME, ({ assetTags, outputName, plugin }) => {
                const chunkfiles = getAllEntryChunkFiles();

                assetTags.scripts.forEach(item => {
                    const { src } = item.attributes;
                    if (typeof src === 'string') {
                        const isChunkFile = chunkfiles.some(filename => -1 < src.indexOf(filename))
                        const entryRule = options && options.entryRule

                        if (isFunction(entryRule)) {
                            item.attributes.entry = !!(entryRule as Function)(src)
                        } else if (!isChunkFile) {
                            item.attributes.entry = true
                        }
                    }
                })

                return (({ assetTags, outputName, plugin }))
            });

        }


    });


}

module.exports = QiankunDevConfigPlugin