# touteta

[![NPM version](http://img.shields.io/npm/v/touteta.svg)](https://www.npmjs.org/package/touteta) ![Dependency Status](https://david-dm.org/leny/touteta.svg) ![Downloads counter](http://img.shields.io/npm/dm/touteta.svg)

> Get the state of all git repos within a directory.

* * *

## Usage

### Installation

To use **touteta**, you must at first install it globally.

    (sudo) npm install -g touteta

### Usage

Using **touteta** is simple:

    touteta [options] [folder]

    Arguments:
        [folder]               folder to inspect

    Options:

        -h, --help             output usage information
        -V, --version          output the version number        

#### Arguments

##### folder

The folder to inspect. Touteta will look for all git repository within the given folder, then will show the state of each of them.

#### Options

##### help (`-h`,`--help`)

Output usage information.

##### version (`-v`,`--version`)

Output **touteta** version number.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint your code using [Grunt](http://gruntjs.com/).

## Release History

* **0.1.0**: Initial release (*07/07/16*)

## License
Copyright (c) 2016 Leny  
Licensed under the MIT license.
