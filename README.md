# grunt-bower-server

> running a requirejs server, the server manages bower components.

## Getting Started
This plugin requires Grunt `~0.4.5`

## 背景

- 提供bower包依赖管理

## 用法

```bash
$ npm install --save-dev grunt-bower-server
```

```js
grunt.initConfig({
  bower_server: {
    develop: {
      options: {
        // API mocking 文件存放目录
        //api: './mock',
        // 指向上级目录
        port: 8888,
        base: '..',
        release: false
      }
    }
  }
});

