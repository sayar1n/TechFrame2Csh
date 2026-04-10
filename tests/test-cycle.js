const assert = require('assert');
const { topologicalSort, validateDependencies } = require('../core/moduleLoader');

function makeModule(name, deps) {
  return { name, dependencies: deps, registerServices: () => {}, initialize: () => {} };
}

const modulesMap = new Map([
  ['A', makeModule('A', ['B'])],
  ['B', makeModule('B', ['C'])],
  ['C', makeModule('C', ['A'])]   // цикл A->B->C->A
]);

validateDependencies(modulesMap); // не выбросит исключение, все модули есть
try {
  topologicalSort(modulesMap);
  assert.fail('Should have thrown a circular dependency error');
} catch (err) {
  assert.ok(err.message.includes('Circular dependency detected'));
  console.log('Test cycle passed:', err.message);
}