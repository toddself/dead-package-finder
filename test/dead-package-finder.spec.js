'use strict'

const path = require('path')

const test = require('tap').test

const DPF = require('../dead-package-finder')
const testPackage = require('./fake-project/package')
const testPackageModules = Object.keys(testPackage.dependencies).concat(Object.keys(testPackage.devDependencies))
const programPackages = ['normal-require', 'global-require', 'compound1', 'compound2', 'myModule']
const deadPackagesFixture = ['builtin-modules',
  'esprima',
  'estraverse',
  'graceful-fs',
  'jsondom',
  'lodash.difference',
  'readdirp']
const deadPackagesDev = [
  'standard',
  'tap']

test('it finds unused packages', function (t) {
  const d = new DPF([], false, path.join(__dirname, './fake-project'))
  d.run()
    .on('error', function (err) {
      t.bailout(err)
    })
    .on('verbose', function () {
      var args = [].slice.call(arguments)

      if (/^modules/.test(args[0])) {
        t.deepEqual(testPackageModules.sort(), args[1].sort(), 'found all the packages')
      }

      if (/^found/.test(args[0])) {
        t.deepEqual(programPackages.sort(), args[1].sort(), 'found all the packages')
      }
    })
    .on('end', function (deadPackages) {
      t.deepEqual(deadPackages.sort(), deadPackagesFixture.concat(deadPackagesDev).sort(), 'found the dead packages')
      t.end()
    })
})

test('it ignores dev packages', function (t) {
  const d = new DPF([], true, path.join(__dirname, './fake-project'))
  d.run()
    .on('error', function (err) {
      t.bailout(err)
    })
    .on('verbose', function () {
      var args = [].slice.call(arguments)

      if (/^modules/.test(args[0])) {
        t.deepEqual(testPackageModules.sort(), args[1].sort(), 'found all the packages')
      }

      if (/^found/.test(args[0])) {
        t.deepEqual(programPackages.sort(), args[1].sort(), 'found all the packages')
      }
    })
    .on('end', function (deadPackages) {
      t.deepEqual(deadPackages.sort(), deadPackagesFixture.sort(), 'found the dead packages')
      t.end()
    })
})

test('bad args', function (t) {
  t.throws(function () {
    const d = new DPF('ignore me')
    d.run()
  }, 'need an array')
  t.end()
})

test('file missing during read op', function (t) {
  const d = new DPF()
  d._processEntry('enoent-file.js').catch(function (err) {
    t.equal(err.code, 'ENOENT', 'got an enoent')
    t.end()
  })
})

test('missing package.json at project root', function (t) {
  const d = new DPF([], true, '/tmp/hi')
  d.run()
  .on('error', function (err) {
    t.equal(err.code, 'ENOENT', 'got an enoent')
    t.end()
  })
})
