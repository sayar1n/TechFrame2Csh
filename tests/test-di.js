const assert = require('assert');
const { Container } = require('../core/container');
const { initializeModules, topologicalSort, validateDependencies } = require('../core/moduleLoader');

// Модуль, который регистрирует сервис
const providerModule = {
  name: 'provider',
  dependencies: [],
  registerServices(container) {
    container.register('dataService', () => ({ getData: () => 'real data' }));
  },
  initialize: async () => {}
};

// Модуль-потребитель, который использует сервис через контейнер (не создаёт вручную)
let consumerInitialized = false;
const consumerModule = {
  name: 'consumer',
  dependencies: ['provider'],
  registerServices: () => {},
  async initialize(container) {
    const service = container.resolve('dataService');
    assert.strictEqual(service.getData(), 'real data');
    consumerInitialized = true;
  }
};

const modulesMap = new Map([
  ['provider', providerModule],
  ['consumer', consumerModule]
]);

validateDependencies(modulesMap);
const order = topologicalSort(modulesMap); // ['provider', 'consumer']
const container = new Container();

(async () => {
  await initializeModules(modulesMap, order, container);
  assert(consumerInitialized, 'Consumer was not initialized');
  console.log('Test DI passed: dependencies are injected via container, no manual creation');
})();