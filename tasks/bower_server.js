/*
 * grunt-bower-server
 * https://github.com/LinNing/grunt-bower-server
 *
 * Copyright (c) 2015 LinNing
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var bowerDeps = require('../lib/bower-deps');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('bower_server', 'running a requirejs server, the server manage bower components', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    function replace(content) {
      var deps, depsDev;

      deps = bowerDeps({
        idleading: options.idleading
      });

      depsDev = bowerDeps({
        dev: true,
        idleading: options.idleading
      });

      function gBase() {
        return options.idleading.replace('/' + grunt.config('pkg.name'), '');
      }

      function gAlias() {
        /*if (!options.release) {
          return '';
        }*/

        var map = [], keys = [];
        var data = deps.all(), n;
        var dep = deps.get();

        for (n in dep) {
          keys.push(n);
          map.push('\'' + n + '\': \'' + dep[n].replace('.js', '') + '\'');
        }

        for (n in data) {
          if (n === deps.ROOT_KEY) {
            continue;
          }

          dep = data[n];

          for (n in dep) {
            if (keys.indexOf(n) !== -1) {
              continue;
            }

            keys.push(n);
            map.push('\'' + n + '\': \'' + dep[n] + '\'');
          }

        }

        return map.join(',\n    ');
      }

      return content
        .replace(/@APPNAME/g, grunt.config('pkg.name'))
        .replace(/@VERSION/g, grunt.config('pkg.version'))
        .replace(/(\/\/)?@BASE/g, gBase())
        .replace(/(\/\/)?@ALIAS/g, gAlias());
    }

    var options = this.options({
      base: '.',
      // 是否生成 config 文件
      config: true,
      port: 8851,
      // 是否模拟线上环境
      release: true
    });

    if (options.rule) {
      if (options.rule.constructor === RegExp) {
        options.rule = function(url/*, query, idleading*/) {
          return options.rule.test(url);
        };
      }
    }

    if (!options.rule) {
      options.rule = options.release ? function() {
        return false;
      } : function(url, query, idleading) {
        if (query.indexOf('nowrap') !== -1) {
          return false;
        }

        if (idleading) {
          if (idleading.indexOf('..') !== -1) {
            url = url.replace(/^\/[^\/]+/, '');
          } else if (url.indexOf(idleading) !== -1) {
            url = url.substring(idleading.length);
          }
        }

        // 默认匹配
        return /^\/(((app|mod|bower_components|src).+)|index)\.(css|handlebars|json|js)$/.test(url);
      };
    }

    options.idleading = '/' + path.relative(options.base, process.cwd()).replace(/\\/g, '/');

    if (options.config) {
      var files = this.files.length ? this.files : [{}];

      files.forEach(function(f) {
        var src = (f.src || [path.join(__dirname, '../lib/assets/config.js')])
        .filter(function(filepath) {
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          } else {
            return true;
          }
        }).map(function(filepath) {
          return replace(grunt.file.read(filepath));
        }).join('');

        f.dest || (f.dest = './lib/config.js');

        grunt.file.write(f.dest, src);

        grunt.log.writeln('File "' + f.dest + '" created.');
      });
    }

    this.async();
    require('../lib/server')(options);
  });

};
