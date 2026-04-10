const assert = require('assert');
const { validateDependencies } = require('../core/moduleLoader');

function makeModule(name, deps) {
  return { name, dependencies: deps, registerServices: () => {}, initialize: () => {} };
}

const modulesMap = new Map([
  ['A', makeModule('A', ['B'])],
  ['B', makeModule('B', ['C'])]   // C отсутствует
]);

try {
  validateDependencies(modulesMap);
  assert.fail('Should have thrown an error');
} catch (err) {
  assert.ok(err.message.includes('Missing required module "C" for module "B"'));
  console.log('Test missing module passed:', err.message);
}