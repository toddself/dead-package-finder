[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Build Status](https://travis-ci.org/toddself/dead-package-finder.svg?branch=master)](https://travis-ci.org/toddself/dead-package-finder)
[![Coverage Status](https://coveralls.io/repos/toddself/dead-package-finder/badge.svg?branch=master&service=github)](https://coveralls.io/github/toddself/dead-package-finder?branch=master)

# dead-package-finder

Inherit a large project and not sure if the package.json lists things that are *actually* used in your software? Got failing installs due to really out-of-date packages that you might not need anymore? Get lazy with development and forget to remove packages that you don't use anymore?

This tool is for you!

This walks all the javascript files in a specified directory and uses esprima to find all the `require` statements in them and matches them up against the packages you've declared a dependency on. If you have a declared dependency that you're not requiring, it'll tell you that so you can take the appropriate action.

## nodejs only!

This uses a bunch of ES6 features and so will only work in nodejs 4.0.0 and higher. But you're like using the latest version, right?

If you need a version compatible back to iojs 2.2.0 or later? You can use `@1.1.2` — but beware that sometimes `verbose` will emit a `Set` and sometimes an `Array`.  Node 4 includes a version of v8 that properly implements `Array#from` allowing the `Set` to be easily re-cast as an Array when emitted

## Usage

```bash
npm install dead-package-finder
./dead-package-finder [options]
```

## Options
```
Options:
    -h, --help                     print usage information
    -v, --version                  show version info and exit
    -i, --ignore-folder            a list of folders to ignore. node_modules
                                   will ALWAYS be ignored
    -r, --project-root             the path to the directory containing the
                                   package.json file
    -d, --ignore-dev-dependencies  ignore any packages listed in devDependencies
    --verbose                      print out way too much info to even be useful
```

## API

See `dead-package-finder.cli.js` for examples on how to use this programatically.

## License
© 2015 Todd Kennedy, Apache 2.0 license
