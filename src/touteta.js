/* touteta
 * https://github.com/leny/touteta
 *
 * JS Document - /touteta.js - main entry point, commander setup and runner
 *
 * Copyright (c) 2016 Leny
 * Licensed under the MIT license.
 */

/* eslint-disable no-console */

import chalk from "chalk";
import fs from "fs";
import path from "path";
import program from "commander";

let pkg = require( "../package.json" ),
    sWatchingRoot;

program
    .version( pkg.version )
    .arguments( "[folder]" )
    .usage( "[options] [folder]" )
    .description( "Get the state of all git repos within a directory." )
    .action( ( sFolder ) => {
        if ( !fs.existsSync( sFolder ) ) {
            return console.log( chalk.bold.red( "✘ given folder doesn't exists, use current path instead." ) );
        }
        if ( !fs.statSync( sFolder ).isDirectory() ) {
            return console.log( chalk.bold.red( "✘ given folder isn't a folder, use current path instead." ) );
        }
        sWatchingRoot = sFolder;
    } )
    .parse( process.argv );
