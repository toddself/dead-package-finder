'use strict'

const fs = require('fs')
const path = require('path')
const events = require('events')
const process = require('process')

const readdirp = require('readdirp')
const esprima = require('esprima')
const estraverse = require('estraverse')

function dedupe (arr) {
  return new Set(arr)
}

class DeadPackageFinder {
  constructor (ignoreList, ignoreDevDeps, projectRoot) {
    this.emitter = new events.EventEmitter()
    ignoreList = ignoreList || []

    if (!Array.isArray(ignoreList)) {
      throw new Error(`ignoreList must be an array ${ignoreList}`)
    }

    this.projectRoot = projectRoot || process.cwd()
    this.ignoreDevDeps = ignoreDevDeps || false
    this.ignoreList = ignoreList
      .concat(['node_modules', '.git'])
      .map(function (ignore) {
        return ignore[0] === '!' ? ignore : `!${ignore}`
      })
  }

  run () {
    const self = this
    this.deps = []
    this.devDevs = []

    this.readPackageJSON()
      .then(function () {
        return self.buildRequireList()
      })
      .then(function (modList) {
        return self.filterLists(modList)
      })
      .catch(function (err) {
        self.emitter('error', err)
      })

    return this.emitter
  }

  readPackageJSON () {
    const self = this
    const pack = path.join(this.projectRoot, 'package.json')
    return new Promise(function (resolve) {
      fs.readFile(pack, 'utf8', function (err, data) {
        if (err) {
          throw err
        }

        data = JSON.parse(data)

        if (data.dependencies) {
          self.deps = Object.keys(data.dependencies) || []
        }

        if (data.devDependencies) {
          self.devDeps = Object.keys(data.devDependencies) || []
        }

        self.emitter.emit('verbose', `modules from ${pack}`, self.deps.concat(self.devDeps))
        resolve()
      })
    })
  }

  buildRequireList () {
    var self = this

    return new Promise(function (resolve) {
      let modules = []
      let _walkerDone = false
      let _count = 0
      let _current = 0

      const opts = {
        root: self.projectRoot,
        fileFilter: '*js',
        directoryFilter: self.ignoreList
      }

      function done () {
        if (_current === _count && _walkerDone) {
          const mods = dedupe(modules)
          self.emitter.emit('verbose', `found the following requires`, mods)
          resolve(mods)
        }
      }

      readdirp(opts)
        .on('warn', function (err) {
          self.emitter('warning', err)
        })
        .on('data', function (entry) {
          ++_count
          self.emitter.emit('verbose', `processing ${entry.fullPath}`)
          self._processEntry(entry.fullPath).then(function (requires) {
            modules = modules.concat(requires)
            ++_current
            done()
          })
        })
        .on('end', function () {
          _walkerDone = true
          done()
        })
    })
  }

  filterLists (modules) {
    const unused = []
    this.deps.forEach(function (dep) {
      if (!modules.has(dep)) {
        unused.push(dep)
      }
    })

    if (!this.ignoreDevDeps) {
      this.devDeps.forEach(function (dep) {
        if (!modules.has(dep)) {
          unused.push(dep)
        }
      })
    }

    this.emitter.emit('end', unused)
  }

  _processEntry (file) {
    const self = this
    return new Promise(function (resolve, reject) {
      fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
          throw err
        }

        // if a script has a #! starting is esprima will choke so cli scripts
        // are gonna cause issues
        data = data.replace(/^#!.*\n?/, '')

        let tree
        try {
          tree = esprima.parse(data)
        } catch (err) {
          self.emitter.emit('warning', `unable to parse ${file}: ${err.message}`)
        }

        const modules = []
        estraverse.traverse(tree, {
          enter: function (node, parent) {
            if (node.type === 'Identifier' && node.name === 'require') {
              if (Array.isArray(parent.arguments)) {
                const arg = parent.arguments[0]
                if (arg.type === 'Literal' && !/^[./]/.test(arg.value)) {
                  modules.push(arg.value)
                }
              }
            }
          }
        })
        resolve(modules)
      })
    })
  }
}

module.exports = DeadPackageFinder
