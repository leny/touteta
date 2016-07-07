/* touteta
 * https://github.com/leny/touteta
 *
 * Copyright (c) 2014 Leny
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function( grunt ) {

    require( "load-grunt-tasks" )( grunt );

    grunt.initConfig( {
        "eslint": {
            "src": [ "src/**/*.js" ]
        },
        "babel": {
            "options": {
                "presets": [ "es2015" ]
            },
            "src": {
                "files": [ {
                    "expand": true,
                    "cwd": "src/",
                    "src": [ "**/*.js" ],
                    "dest": "lib/"
                } ]
            }
        },
        "concat": {
            "options": {
                "banner": "#!/usr/bin/env node\n\n"
            },
            "lib": {
                "src": "lib/touteta.js",
                "dest": "lib/touteta.js"
            }
        },
        "watch": {
            "src": {
                "files": "src/**/*.js",
                "tasks": [ "default" ]
            }
        }
    } );

    grunt.registerTask( "default", [
        "eslint",
        "babel",
        "concat"
    ] );

    grunt.registerTask( "work", [
        "default",
        "watch"
    ] );

};
