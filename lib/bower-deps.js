/*
 * bower-deps
 *
 * Description: parse tree of bower dependencies
 */

'use strict';

var fs = require('fs');
var path = require('path');

var BOWER_COMPONENTS = 'bower_components';
var ROOT_KEY = '//';

var relativeToCwd = path.relative(__dirname, process.cwd()).replace(/\\/g, '/');
var bowerComponentRoot = path.join(process.cwd(), BOWER_COMPONENTS);

/*jshint maxparams:4 */

function _require(arr) {
  if (typeof arr === 'string') {
    arr = [arr];
  }

  arr.unshift(relativeToCwd);

  return require(arr.join('/'));
}

function getDep(tree, mod, dependencies, options) {
  var map = {};

  var n, v, dir, pkg;

  for (n in dependencies) {
    v = dependencies[n];
    dir = path.join(bowerComponentRoot, n);

    if (fs.existsSync(dir)) {
      pkg = _require([BOWER_COMPONENTS, n, 'bower.json']);
      if (!pkg.main) {
        continue;
      }

      map[n] = [options.idleading, n, pkg.main.replace(/^\.\//, '')].join('/');

      // sub tree
      getDep(tree, n, pkg[options.dev ? 'devDependencies' : 'dependencies'], options);
    }
  }

  if (n !== undefined) {
    tree.set(mod, map);
  }
}

module.exports = function getDeps(options) {
  var tree = {};
  var data = {};

  options || (options = {});

  options.idleading || (options.idleading = '');
  options.dev || (options.dev = false);

  if (options.idleading) {
    options.idleading += '/';
  }

  options.idleading += BOWER_COMPONENTS;

  tree.set = function(mod, dependencies) {
    if (!mod) {
      mod = ROOT_KEY;
    }

    data[mod] = dependencies;
  };

  tree.get = function(mod, dependency) {
    if (!mod) {
      mod = ROOT_KEY;
    }

    if (dependency) {
      var cur = data[mod];
      return cur ? cur[dependency] : undefined;
    }

    return data[mod];
  };

  tree.all = function() {
    return data;
  };

  tree.ROOT_KEY = ROOT_KEY;

  var pkg = _require('bower.json');

  if (pkg.dependencies) {
    getDep(tree, '', pkg[options.dev ? 'devDependencies' : 'dependencies'], options);
  }

  return tree;
};
