# qiankun-dev-webpack-plugin

[English](README.md) [中文](README.zh.md)

Modify your webpack configs to fit qiankun subapp development。

## How to use

```javascript
const QiankunDevPlugin = require("qiankun-dev-webpack-plugin");

module.exports = {
  // create a new instance to plugins array
  plugins: [new QiankunDevPlugin()]
};
```

## Options

You can pass a hash of configuration options to `qiankun-dev-webpack-plugin`.

|     Name      |    Type    |         Default         | Description       |
| :-----------: | :--------: | :---------------------: | :---------------- |
| **`appName`** | `{String}` | `package.json`'s `name` | Library namespace |
| **`entryRule`** | `(src: string) => boolean` | undefined | declare entry tag controlled |

## What does it modified

1. Set `output.libraryTarget` to `umd` modules
1. Add an `entry` attribute to `entry` script tag when using `HtmlWebpackPlugin` (If you do not use `HtmlWebpackPlugin` or its `inject` option is `false`, you **MUST** config an `entry` attribute for the entry script yourself)
1. Config devServer's header to handle `CORS` request and correct sourcemap url while `process.env.NODE_ENV` is set to `development`
1. `entry script` will be controlled by `entryRule` function, see [here](https://qiankun.umijs.org/faq/#application-died-in-status-loading-source-code-you-need-to-export-the-functional-lifecycles-in-xxx-entry)

## DIY modifications

- Config `devServer.host`, to change host name
- Config `devServer.headers` to allow `cors` custom headers
- Config `devServer.allowdHosts` or `devServer.disableHostCheck`
