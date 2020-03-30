# qiankun-dev-webpack-plugin

[English](README.md) [中文](README.zh.md)

修改 webpack 配置，以便 qiankun 子应用嵌入 master 应用中。

## 如何使用

```javascript
const QiankunDevPlugin = require("qiankun-dev-webpack-plugin");

module.exports = {
  // create a new instance to plugins array
  plugins: [new QiankunDevPlugin()]
};
```

## Options

在创建新对象时可以传入的参数如下：

|   参数名称    |    类型    |            默认值            | 说明     |
| :-----------: | :--------: | :--------------------------: | :------- |
| **`appName`** | `{String}` | `package.json`里的`name`属性 | 命名空间 |

## 这个插件修改了什么

1. 将 `output.libraryTarget` 设置为 `umd` 模块
1. 在使用 `HtmlWebpackPlugin`插件时，给`entry`的 script 标签添加 `entry` 属性(如果你不使用 `HtmlWebpackPlugin` 或者将 `inject` 参数设置为 `false`， **必须** 自己手动给`entry`的 script 标签加上 `entry` 属性)
1. 当`process.env.NODE_ENV`设置为 `development`时，设置 devServer 的 header 去处理 `CORS` 的跨域请求和 SourceMap 的 url

## 其他可以手动设置的参数

- Config `devServer.host`, to change host name
- Config `devServer.headers` to allow `cors` custom headers
- Config `devServer.allowdHosts` or `devServer.disableHostCheck`
