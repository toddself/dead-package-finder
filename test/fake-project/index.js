#!/lets/test/stripping/this
var test1 = require('normal-require')
var test2 = require(path.join('test', 'function-call-require'))
var test3 = require('./dot-slash-require')
var test4 = require('/absolute-require')
require('global-require')
require(path.join('test', 'function-call-global'))
require('./dot-slash-global')
require('/absolute-global')
var test6 = require('compound1'),
    test7 = require('compound2')

import thisModule from 'myModule'
