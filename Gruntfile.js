/*
 * grunt-bower-server
 * https://github.com/LinNing/grunt-bower-server
 *
 * Copyright (c) 2015 LinNing
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    server: {
      develop: {
        options: {
          base: 'tests',
          config: false,
          release: false
        }
      }
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['server:develop']);

};
