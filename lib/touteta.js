#!/usr/bin/env node

"use strict";

var _cliSpinner = require("cli-spinner");

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _fsPromise = require("fs-promise");

var _fsPromise2 = _interopRequireDefault(_fsPromise);

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _isGitRepo = require("is-git-repo");

var _isGitRepo2 = _interopRequireDefault(_isGitRepo);

var _cliTable = require("cli-table2");

var _cliTable2 = _interopRequireDefault(_cliTable);

var _execa = require("execa");

var _execa2 = _interopRequireDefault(_execa);

var _parseStatus = require("./parse-status");

var _parseStatus2 = _interopRequireDefault(_parseStatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pkg = require("../package.json"),
    fStartMainAction = void 0,
    _fCheckPath = void 0,
    fCheckGit = void 0,
    fGetSubPaths = void 0,
    fDisplayGitStatus = void 0,
    oSpinner = new _cliSpinner.Spinner(),
    sRootPath = process.cwd(),
    oResults = new _cliTable2.default({
    "head": ["Repository", "Status", "Local branch", "Remote branch"]
}); /* touteta
     * https://github.com/leny/touteta
     *
     * JS Document - /touteta.js - main entry point, commander setup and runner
     *
     * Copyright (c) 2016 Leny
     * Licensed under the MIT license.
     */

/* eslint-disable no-console */

oSpinner.setSpinnerString(18);

fCheckGit = function fCheckGit(sPath) {
    return new _bluebird2.default(function (fResolve) {
        return !!(0, _isGitRepo2.default)(sPath, fResolve);
    });
};

fGetSubPaths = function fGetSubPaths(sFromPath) {
    return _fsPromise2.default.readdir(sFromPath).then(function (aPaths) {
        return aPaths.map(function (sPath) {
            return sFromPath + "/" + sPath;
        });
    });
};

_fCheckPath = function fCheckPath(sPath) {
    return fCheckGit(sPath).then(function (bIsGit) {
        if (bIsGit) {
            return fDisplayGitStatus(sPath);
        }
        return _fsPromise2.default.stat(sPath).then(function (oStat) {
            if (oStat.isDirectory()) {
                return _bluebird2.default.map(fGetSubPaths(sPath), _fCheckPath);
            }
        });
    });
};

fDisplayGitStatus = function fDisplayGitStatus(sPath) {
    var sRepoPath = _chalk2.default.cyan(sPath.replace(sRootPath, "."));

    return (0, _execa2.default)("git", ["status", "--porcelain", "-b"], { "cwd": sPath }).then(function (_ref) {
        var stdout = _ref.stdout;

        var oStatus = (0, _parseStatus2.default)(stdout),
            aStatus = [],
            sLocalBranch = _chalk2.default.magenta(oStatus.local),
            sRemoteBranch = _chalk2.default.cyan(oStatus.remote);

        oStatus.clean && aStatus.push(_chalk2.default.bold.green("clean"));

        Object.keys(oStatus).forEach(function (sKey) {
            var mValue = oStatus[sKey];

            if (!mValue) {
                return;
            }
            switch (sKey) {
                case "untracked":
                    aStatus.push(mValue + " " + _chalk2.default.green("untracked"));
                    break;
                case "added":
                    aStatus.push(mValue + " " + _chalk2.default.green("added"));
                    break;
                case "modified":
                    aStatus.push(mValue + " " + _chalk2.default.yellow("modified"));
                    break;
                case "deleted":
                    aStatus.push(mValue + " " + _chalk2.default.red("deleted"));
                    break;
                case "ahead":
                    sLocalBranch += " (" + mValue + " " + _chalk2.default.bold.yellow("ahead") + ")";
                    break;
                case "behind":
                    sRemoteBranch += " (" + mValue + " " + _chalk2.default.cyan("behind") + ")";
                    break;
                case "diverged":
                    sLocalBranch += " (" + mValue + " " + _chalk2.default.bold.red("diverged") + ")";
                    break;
            }
        });

        oResults.push([sRepoPath, aStatus.join(", "), sLocalBranch, sRemoteBranch]);
    });
};

fStartMainAction = function fStartMainAction(sFolder) {
    _fsPromise2.default.exists(sFolder).then(function (bExists) {
        if (bExists) {
            return _fsPromise2.default.stat(sFolder).then(function (oStat) {
                return oStat.isDirectory();
            });
        }
        return _bluebird2.default.resolve(bExists);
    }).then(function (bPathIsOK) {
        if (!bPathIsOK) {
            console.log(_chalk2.default.bold.red("✘ given folder doesn't exists, use current path instead."));
        }
        sRootPath = sFolder;

        oSpinner.setSpinnerTitle("Checking repos within " + _chalk2.default.cyan(sRootPath) + "…");
        oSpinner.start();

        return _bluebird2.default.map(fGetSubPaths(sRootPath), _fCheckPath);
    }).then(function () {
        oSpinner.stop(true);
        oResults.sort(function (a, b) {
            return a[0].localeCompare(b[0]);
        });

        console.log(oResults.toString());
    }).catch(function (oError) {
        oSpinner.stop(true);
        console.log(_chalk2.default.bold.red("error:"), oError);
        process.exit(1);
    });
};

_commander2.default.version(pkg.version).arguments("[folder]").usage("[options] [folder]").description("Get the state of all git repos within a directory.").action(fStartMainAction).parse(process.argv);
