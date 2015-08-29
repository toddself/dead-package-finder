#!/usr/bin/env node
'use strict'

const opts = {
  alias: {
    h: 'help',
    v: 'version',
    i: 'ignore-folder',
    r: 'project-root',
    d: 'ignore-dev-dependencies'
  },
  default: {
    verbose: false,
    'ignore-dev-dependencies': false,
    'project-root': process.cwd(),
    'ignore-folder': '',
    'help': false,
    'version': false
  },
  boolean: ['verbose', 'ignore-dev-dependencies', 'help', 'version']
}

const fs = require('fs')
const path = require('path')

const args = require('minimist')(process.argv.slice(2), opts)
const log = require('npmlog')
const DPF = require('./dead-package-finder')

function showVersion () {
  var pkg = require('./package.json')
  return console.log(pkg.name + ':', pkg.version)
}

function showUsage () {
  return fs.createReadStream(path.join(__dirname, 'usage.txt')).pipe(process.stdout)
}

function main (args) {
  if (args.help) {
    return showUsage()
  }

  if (args.version) {
    return showVersion()
  }

  let ignoreList
  if (args['ignore-folder'].length) {
    ignoreList = args['ignore-folder'].split(',')
  }
  const projectRoot = args['project-root']
  const ignoreDevDeps = args['ignore-dev-dependencies']

  const d = new DPF(ignoreList, ignoreDevDeps, projectRoot)
  d.run()
    .on('verbose', function () {
      if (args.verbose) {
        log.info.apply(log, ['dead-package-finder'].concat([].slice.call(arguments)))
      }
    })
    .on('error', function (err) {
      log.error('dead-package-finder', err)
      process.exit(1)
    })
    .on('end', function (deadPackages) {
      log.info('dead-package-finder', 'The following packages are required in your package.json but not required by your code')
      deadPackages.forEach(function (pkg) {
        log.info('dead-package-finder', pkg)
      })
    })
}

main(args)
