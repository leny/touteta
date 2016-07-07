"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (sStatus) {
    var oStatus = {},
        aBranchInfos = sStatus.match(/^## (.*)\.\.\.([^ ]*)(?: \[(ahead|behind|diverged) (.*)\])?/mi);

    oStatus.untracked = fMatchCount(sStatus, /^\?\? /gmi);
    oStatus.added = fMatchCount(sStatus, /^A  /gmi, /^M  /gmi);
    oStatus.modified = fMatchCount(sStatus, /^ M /gmi, /^AM /gmi, /^ T /gmi);
    oStatus.renamed = fMatchCount(sStatus, /^R  /gmi);
    oStatus.deleted = fMatchCount(sStatus, /^ D /gmi, /^D  /gmi, /^AD /gmi);

    oStatus.clean = !oStatus.untracked && !oStatus.added && !oStatus.modified && !oStatus.renamed && !oStatus.deleted;

    if (aBranchInfos) {
        var _aBranchInfos = _slicedToArray(aBranchInfos, 5);

        var sLocalBranch = _aBranchInfos[1];
        var sRemoteBranch = _aBranchInfos[2];
        var sState = _aBranchInfos[3];
        var sAmount = _aBranchInfos[4];


        oStatus.local = sLocalBranch;
        oStatus.remote = sRemoteBranch;

        oStatus.ahead = sState === "ahead" ? +sAmount : false;
        oStatus.behind = sState === "behind" ? +sAmount : false;
        oStatus.diverged = sState === "diverged" ? +sAmount : false;
    }

    return oStatus;
};

/* touteta
 * https://github.com/leny/touteta
 *
 * JS Document - /parse-status.js - parse 'git status --porcelain -b' command
 *
 * Copyright (c) 2016 Leny
 * Licensed under the MIT license.
 */

// cf. https://github.com/leny/pwendok/blob/master/zsh/custom/plugins/leny-git-prompt/leny-git-prompt.plugin.zsh

var fMatchCount = function fMatchCount(sStr) {
    for (var _len = arguments.length, aRegexes = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        aRegexes[_key - 1] = arguments[_key];
    }

    var aResults = aRegexes.map(function (rPattern) {
        var mResult = void 0;

        return Array.isArray(mResult = sStr.match(rPattern)) ? mResult.length : 0;
    });

    return aResults.reduce(function (a, b) {
        return a + b;
    }, 0) || false;
};
