/* touteta
 * https://github.com/leny/touteta
 *
 * JS Document - /parse-status.js - parse 'git status --porcelain -b' command
 *
 * Copyright (c) 2016 Leny
 * Licensed under the MIT license.
 */

// cf. https://github.com/leny/pwendok/blob/master/zsh/custom/plugins/leny-git-prompt/leny-git-prompt.plugin.zsh

let fMatchCount = function( sStr, ...aRegexes ) {
    let aResults = aRegexes.map( ( rPattern ) => {
        let mResult;

        return Array.isArray( mResult = sStr.match( rPattern ) ) ? mResult.length : 0;
    } );

    return aResults.reduce( ( a, b ) => a + b, 0 ) || false;
};

export default function( sStatus ) {
    let oStatus = {},
        aBranchInfos = sStatus.match( /^## (.*)\.\.\.([^ ]*)(?: \[(ahead|behind|diverged) (.*)\])?/mi );

    oStatus.untracked = fMatchCount( sStatus, /^\?\? /gmi );
    oStatus.added = fMatchCount( sStatus, /^A  /gmi, /^M  /gmi );
    oStatus.modified = fMatchCount( sStatus, /^ M /gmi, /^AM /gmi, /^ T /gmi );
    oStatus.renamed = fMatchCount( sStatus, /^R  /gmi );
    oStatus.deleted = fMatchCount( sStatus, /^ D /gmi, /^D  /gmi, /^AD /gmi );

    oStatus.clean = ( !oStatus.untracked && !oStatus.added && !oStatus.modified && !oStatus.renamed && !oStatus.deleted );

    if ( aBranchInfos ) {
        let [ , sLocalBranch, sRemoteBranch, sState, sAmount ] = aBranchInfos;

        oStatus.local = sLocalBranch;
        oStatus.remote = sRemoteBranch;

        oStatus.ahead = sState === "ahead" ? +sAmount : false;
        oStatus.behind = sState === "behind" ? +sAmount : false;
        oStatus.diverged = sState === "diverged" ? +sAmount : false;
    }

    return oStatus;
}
