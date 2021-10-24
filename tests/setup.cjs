var path = require('path');
var chai = require('chai');

require('ts-node').register({
  project: 'tsconfig.test.json',
});

global.modPath = path.resolve(__dirname, '..', 'dist');
global.expect = chai.expect;
