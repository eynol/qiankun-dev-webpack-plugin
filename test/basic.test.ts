import webpack from 'webpack'
import path from 'path'
import fs from 'fs'

import HtmlWebpackPlugin from 'html-webpack-plugin'

const OUTPUT_DIR = path.resolve(__dirname, '.tmp');

const num = () => (~(Math.random() * 400))
const testDir = (name) => path.join(__dirname, 'fixtures', name)

function testHtmlPlugin(webpackConfig: webpack.Configuration, expectedResults, outputFile, done, expectErrors?: any, expectWarnings?: any) {
    outputFile = outputFile || 'index.html';
    webpack(webpackConfig, (err, stats) => {
        expect(err).toBeFalsy();
        const compilationErrors = (stats.compilation.errors || []).join('\n');
        if (expectErrors) {
            expect(compilationErrors).not.toBe('');
        } else {
            expect(compilationErrors).toBe('');
        }
        const compilationWarnings = (stats.compilation.warnings || []).join('\n');
        if (expectWarnings) {
            expect(compilationWarnings).not.toBe('');
        } else {
            expect(compilationWarnings).toBe('');
        }
        if (outputFile instanceof RegExp) {
            const fileNames = Object.keys(stats.compilation.assets);
            const matches = Object.keys(stats.compilation.assets).filter(item => outputFile.test(item));
            expect(matches[0] || fileNames).not.toEqual(fileNames);
            outputFile = matches[0];
        }
        expect(outputFile.indexOf('[hash]') === -1).toBe(true);
        const outputFileExists = fs.existsSync(path.join(OUTPUT_DIR, outputFile));
        expect(outputFileExists).toBe(true);
        if (!outputFileExists) {
            return done();
        }
        const htmlContent = fs.readFileSync(path.join(OUTPUT_DIR, outputFile)).toString();
        let chunksInfo;
        for (let i = 0; i < expectedResults.length; i++) {
            const expectedResult = expectedResults[i];
            if (expectedResult instanceof RegExp) {
                expect(htmlContent).toMatch(expectedResult);
            } else if (typeof expectedResult === 'object') {
                if (expectedResult.type === 'chunkhash') {
                    if (!chunksInfo) {
                        chunksInfo = getChunksInfoFromStats(stats);
                    }
                    const chunkhash = chunksInfo[expectedResult.chunkName].hash;
                    expect(htmlContent).toContain(expectedResult.containStr.replace('%chunkhash%', chunkhash));
                }
            } else {
                expect(htmlContent).toContain(expectedResult.replace('%hash%', stats.hash));
            }
        }
        done();
    });
}

function getChunksInfoFromStats(stats) {
    const chunks = stats.compilation.getStats().toJson().chunks;
    const chunksInfo = {};
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkName = chunk.names[0];
        if (chunkName) {
            chunksInfo[chunkName] = chunk;
        }
    }
    return chunksInfo;
}
beforeEach(() => {
    fs.rmdirSync(path.join(__dirname, '.tmp'), { recursive: true, })
})


const QiankunDevPlugin = require('../src/index')
describe('gain appName', () => {

    it('should export function', () => {
        expect(typeof QiankunDevPlugin).toBe('function')
        expect(QiankunDevPlugin).toBeInstanceOf(Object)
    })


    it('should read package.json\'s name as default appName', done => {
        const fakeLoooonnnngggName = ('superlongname' + num() + '' + num())
        jest.mock(path.join(process.cwd(), 'package.json'), () => ({
            name: fakeLoooonnnngggName
        }))
        testHtmlPlugin({
            mode: 'production',
            entry: testDir('one.js'),
            output: {
                path: OUTPUT_DIR,
                filename: '[name]_bundle.js'
            },
            plugins: [
                new QiankunDevPlugin()
            ]
        }, [fakeLoooonnnngggName], 'main_bundle.js', done)

    });

    it('should throw error when package.json not exist under process.cwd path', () => {
        process.chdir(path.join(__dirname))
        expect(() => webpack({
            mode: 'production',
            entry: testDir('one.js'),
            output: {
                path: OUTPUT_DIR,
                filename: '[name]_bundle.js'
            },
            plugins: [
                new QiankunDevPlugin()
            ]
        })
        ).toThrowError(/is not exist, you can config appName for this plugin/)
        process.chdir(path.join(__dirname, '../'))
    })

    it('should use custom appName', done => {
        const fakeAppname = ('customeName' + num() + '' + num())
        jest.mock(path.join(process.cwd(), 'package.json'), () => ({
            name: 'fakeLoooonnnngggName'
        }))
        testHtmlPlugin({
            mode: 'production',
            entry: testDir('one.js'),
            output: {
                path: OUTPUT_DIR,
                filename: '[name]_bundle.js'
            },
            plugins: [
                new QiankunDevPlugin({
                    appName: fakeAppname
                })
            ]
        }, [fakeAppname], 'main_bundle.js', done)

    });

});


describe('change webpack output library', () => {
    it('should set output library to umd', done => {

        const output: webpack.Output = {
            path: OUTPUT_DIR,
            filename: '[name].js'
        }

        const appName = 'library' + num()
        webpack({
            mode: 'production',
            entry: testDir('one.js'),
            output: output,
            plugins: [
                new QiankunDevPlugin({
                    appName
                })
            ]
        }, (err, stats) => {
            const { compilation } = stats
            expect(err).toBeFalsy()
            expect(compilation.outputOptions.jsonpFunction).toBe(`webpackJsonp_${appName}`)
            expect(compilation.outputOptions.libraryTarget).toBe('umd')
            expect(compilation.outputOptions.library).toBe(`${appName}-[name]`)
            done()
        })

    })
})

describe('NODE_ENV=development', () => {
    const env = Object.assign({}, process.env);
    beforeEach(() => {
        process.env.NODE_ENV = 'development'
    })
    afterEach(() => {
        process.env = Object.assign({}, env)
    })

    const webpackConfig: webpack.Configuration = {
        mode: 'development',
        entry: testDir('one.js'),
        output: {
            path: OUTPUT_DIR,
            filename: 'main.js'
        },
        devServer: {
            port: 9999,
        },
        plugins: [
            new QiankunDevPlugin({
                appName: 'sss'
            })
        ]
    }

    it('should generate sourcemap', done => {
        testHtmlPlugin(webpackConfig,
            ['main.js.map'],
            'main.js',
            () => {


                expect(fs.existsSync(path.join(__dirname, '.tmp/main.js.map'))).toBeTruthy()
                const sourceMapContent = fs.readFileSync(path.join(__dirname, '.tmp/main.js.map')).toString()
                expect(sourceMapContent).toContain('webpack://sss')
                done()
            })
    })

    it('should close devtool', done => {
        webpack(webpackConfig, (_err, stats) => {
            const { options } = stats.compilation.compiler;
            expect(options.devtool).toBe(false)
            expect(options.output?.devtoolNamespace).toBe('sss-[name]')
            done()
        })
    })

    it('should add custom headers to devServer ', done => {
        webpack(webpackConfig, (_err, stats) => {
            const devServer = stats.compilation.compiler.options.devServer;
            expect(devServer?.headers!['Access-Control-Allow-Origin']).toBe('*')
            expect(devServer?.headers!['Access-Control-Allow-Credentials']).toBe('true')
            expect(devServer?.headers!['Access-Control-Allow-Methods']).toBe('GET, POST, PUT, DELETE, OPTIONS')
            done()
        })
    })

    it('only set port => localhost:port', done => {

        const appName = 'library' + num()
        webpack({
            ...webpackConfig,
            plugins: [
                new QiankunDevPlugin({
                    appName
                })
            ]
        }, (err, stats) => {
            expect(err).toBeFalsy()
            const { compilation } = stats
            const publicPath = 'http://localhost:9999/'
            expect(compilation.outputOptions.publicPath).toBe(publicPath)
            const jsContent = fs.readFileSync(path.join(__dirname, '.tmp/main.js')).toString()
            expect(jsContent).toContain(publicPath + 'main.js.map')
            done()
        })

    })
    it('set host and port => localhost:port', done => {

        const appName = 'library' + num()
        webpack({
            ...webpackConfig,
            devServer: { port: 49999, host: 'pub.domain' },
            plugins: [
                new QiankunDevPlugin({
                    appName
                })
            ]
        }, (err, stats) => {
            expect(err).toBeFalsy()
            const { compilation } = stats
            const publicPath = 'http://pub.domain:49999/'
            expect(compilation.outputOptions.publicPath).toBe(publicPath)
            const jsContent = fs.readFileSync(path.join(__dirname, '.tmp/main.js')).toString()
            expect(jsContent).toContain(publicPath)
            done()
        })

    })



})

describe('HtmlWebpackPlugin hook', () => {
    it('should support string entry', done => {
        testHtmlPlugin({
            mode: 'production',
            entry: testDir('one.js'),
            output: {
                path: OUTPUT_DIR,
                filename: '[name].js'
            },
            optimization: {
                splitChunks: {
                    minSize: 2,
                    maxSize: 1000,
                }
            },
            plugins: [
                new QiankunDevPlugin(),
                new HtmlWebpackPlugin({
                    chunks: ['main'],
                })
            ]
        }, [/<script src="main[^"]+" entry>/], 'index.html', done)
    })



    it('should support multi entry', done => {
        testHtmlPlugin({
            mode: 'production',
            entry: {
                one: testDir('one.js'),
                two: testDir('two.js')
            },
            output: {
                path: OUTPUT_DIR,
                filename: '[name].js'
            },
            optimization: {
                splitChunks: {
                    minSize: 2,
                    maxSize: 1000,
                }
            },
            plugins: [
                new QiankunDevPlugin(),
                new HtmlWebpackPlugin({
                    chunks: ['one'],
                    filename: 'one.html'
                }),
                new HtmlWebpackPlugin({
                    chunks: ['two'],
                    filename: 'two.html'
                })
            ]
        }, [/<script src="two[^"]+" entry>/], 'two.html', done)
    })


    it('should support mutil script', done => {
        testHtmlPlugin({
            mode: 'production',
            entry: {
                one: testDir('one.js'),
                two: testDir('two.js')
            },
            output: {
                path: OUTPUT_DIR,
                filename: '[name].js'
            },
            optimization: {
                splitChunks: {
                    minSize: 100,
                    maxSize: 1000000,
                    cacheGroups: {
                        common: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'common',
                            chunks: 'initial',
                            priority: 2,
                            minChunks: 1,
                        },
                    }
                },
            },

            plugins: [
                new QiankunDevPlugin(),
                new HtmlWebpackPlugin({
                    chunks: ['two'],
                    filename: 'two.html'
                })
            ]
        }, [/<script src="two[^"]+" entry>/], 'two.html', done)
    })

})

describe('Support entryRule', () => {
    it('should support mutil script', done => {
        testHtmlPlugin({
            mode: 'production',
            entry: {
                one: testDir('one.js'),
                two: testDir('two.js')
            },
            output: {
                path: OUTPUT_DIR,
                filename: '[name].js'
            },
            optimization: {
                splitChunks: {
                    minSize: 100,
                    maxSize: 1000000,
                    cacheGroups: {
                        common: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'common',
                            chunks: 'initial',
                            priority: 2,
                            minChunks: 1,
                        },
                    }
                },
            },

            plugins: [
                new QiankunDevPlugin({
                    entryRule: (src) => {
                        return /common/.test(src) // on purpose
                    }
                }),
                new HtmlWebpackPlugin({
                    chunks: ['two'],
                    filename: 'two.html'
                })
            ]
        }, [/<script src="common[^"]+" entry>/], 'two.html', done)
    })

})