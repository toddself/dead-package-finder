'use strict'

const path = require('path')

const test = require('tap').test

const DPF = require('../dead-package-finder')
const testPackage = require('./fake-project/package')
const testPackageModules = Object.keys(testPackage.dependencies).concat(Object.keys(testPackage.devDependencies))
const programPackages = ['fs', 'path', 'events', 'process', 'readdirp', 'esprima', 'estraverse', 'normal-require', 'global-normal-require', 'normal-require-compound', 'normal-require-compound2']
const deadPackagesFixture = [ 'esprima', 'estraverse', 'readdirp' ]

test('it finds unused packages', function (t) {
  const d = new DPF([], false, path.join(__dirname, './fake-project'))
  d.run()
    .on('error', function (err) {
      t.bailout(err)
    })
    .on('verbose', function () {
      var args = [].slice.call(arguments)
      console.log.apply(console, args)

      if (/^modules/.test(args[0])) {
        t.deepEqual(testPackageModules.sort(), args[1].sort(), 'found all the packages')
      }

      if (/^found/.test(args[0])) {
        programPackages.forEach(function (pack) {
          t.ok(args[1].has(pack), `has package ${pack}`)
        })
      }
    })
    .on('end', function (deadPackages) {
      t.deepEqual(deadPackages.sort(), deadPackagesFixture.sort(), 'dead packages match')
      t.end()
    })
})