const assert = require('assert');
const { topologicalSort, validateDependencies } = require('../core/moduleLoader');

// Создаём тестовые модули (без файловой системы)
function makeModule(name, deps) {
  return { name, dependencies: deps, registerServices: () => {}, initialize: () => {} };
}

const modulesMap = new Map([
  ['A', makeModule('A', ['B'])],
  ['B', makeModule('B', ['C'])],
  ['C', makeModule('C', [])]
]);

validateDependencies(modulesMap);
const order = topologicalSort(modulesMap);
assert.deepStrictEqual(order, ['C', 'B', 'A']);
console.log('Test order passed: C -> B -> A');