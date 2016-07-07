/* touteta
 * https://github.com/leny/touteta
 *
 * JS Document - /touteta.js - main entry point, commander setup and runner
 *
 * Copyright (c) 2016 Leny
 * Licensed under the MIT license.
 */

/* eslint-disable no-console */

import { Spinner } from "cli-spinner";
import Promise from "bluebird";
import chalk from "chalk";
import fs from "fs-promise";
import program from "commander";
import isGit from "is-git-repo";
import Table from "cli-table2";
import shell from "execa";
import parseGitStatus from "./parse-status";

let pkg = require( "../package.json" ),
    fStartMainAction, fCheckPath, fCheckGit, fGetSubPaths, fDisplayGitStatus,
    oSpinner = new Spinner(),
    sRootPath = process.cwd(),
    oResults = new Table( {
        "head": [ "Repository", "Status", "Local branch", "Remote branch" ]
    } );

oSpinner.setSpinnerString( 18 );

fCheckGit = function( sPath ) {
    return new Promise( ( fResolve ) => !!isGit( sPath, fResolve ) );
};

fGetSubPaths = function( sFromPath ) {
    return fs.readdir( sFromPath ).then( ( aPaths ) => {
        return aPaths.map( ( sPath ) => `${ sFromPath }/${ sPath }` );
    } );
};

fCheckPath = function( sPath ) {
    return fCheckGit( sPath ).then( ( bIsGit ) => {
        if ( bIsGit ) {
            return fDisplayGitStatus( sPath );
        }
        return fs.stat( sPath ).then( ( oStat ) => {
            if ( oStat.isDirectory() ) {
                return Promise.map( fGetSubPaths( sPath ), fCheckPath );
            }
        } );
    } );
};

fDisplayGitStatus = function( sPath ) {
    let sRepoPath = chalk.cyan( sPath.replace( sRootPath, "." ) );

    return shell( "git", [ "status", "--porcelain", "-b" ], { "cwd": sPath } )
        .then( ( { stdout } ) => {
            let oStatus = parseGitStatus( stdout ),
                aStatus = [],
                sLocalBranch = chalk.magenta( oStatus.local ),
                sRemoteBranch = chalk.cyan( oStatus.remote );

            oStatus.clean && aStatus.push( chalk.bold.green( "clean" ) );

            Object.keys( oStatus ).forEach( ( sKey ) => {
                let mValue = oStatus[ sKey ];

                if ( !mValue ) {
                    return;
                }
                switch ( sKey ) {
                    case "untracked":
                        aStatus.push( `${ mValue } ${ chalk.green( "untracked" ) }` );
                        break;
                    case "added":
                        aStatus.push( `${ mValue } ${ chalk.green( "added" ) }` );
                        break;
                    case "modified":
                        aStatus.push( `${ mValue } ${ chalk.yellow( "modified" ) }` );
                        break;
                    case "deleted":
                        aStatus.push( `${ mValue } ${ chalk.red( "deleted" ) }` );
                        break;
                    case "ahead":
                        sLocalBranch += ` (${ mValue } ${ chalk.bold.yellow( "ahead" ) })`;
                        break;
                    case "behind":
                        sRemoteBranch += ` (${ mValue } ${ chalk.cyan( "behind" ) })`;
                        break;
                    case "diverged":
                        sLocalBranch += ` (${ mValue } ${ chalk.bold.red( "diverged" ) })`;
                        break;
                }
            } );

            oResults.push( [ sRepoPath, aStatus.join( ", " ), sLocalBranch, sRemoteBranch ] );
        } );
};

fStartMainAction = function( sFolder ) {
    fs.exists( sFolder )
        .then( ( bExists ) => {
            if ( bExists ) {
                return fs.stat( sFolder )
                    .then( ( oStat ) => {
                        return oStat.isDirectory();
                    } );
            }
            return Promise.resolve( bExists );
        } )
        .then( ( bPathIsOK ) => {
            if ( !bPathIsOK ) {
                console.log( chalk.bold.red( "✘ given folder doesn't exists, use current path instead." ) );
            }
            sRootPath = sFolder;

            oSpinner.setSpinnerTitle( `Checking repos within ${ chalk.cyan( sRootPath ) }…` );
            oSpinner.start();

            return Promise.map( fGetSubPaths( sRootPath ), fCheckPath );
        } )
        .then( () => {
            oSpinner.stop( true );
            oResults.sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) );

            console.log( oResults.toString() );
        } )
        .catch( ( oError ) => {
            oSpinner.stop( true );
            console.log( chalk.bold.red( "error:" ), oError );
            process.exit( 1 );
        } );
};

program
    .version( pkg.version )
    .arguments( "[folder]" )
    .usage( "[options] [folder]" )
    .description( "Get the state of all git repos within a directory." )
    .action( fStartMainAction )
    .parse( process.argv );
