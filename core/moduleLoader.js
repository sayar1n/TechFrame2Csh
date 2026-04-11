const path = require('path');
const fs = require('fs');

// Загрузка модулей из папки по списку имён
function loadModules(moduleNames, modulesDir) {
  const modules = new Map();
  for (const name of moduleNames) {
    const modulePath = path.join(modulesDir, `${name}.js`);
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Файл модуля не найден: ${modulePath}`);
    }
    const mod = require(modulePath);
    // Проверка контракта
    if (!mod.name || typeof mod.name !== 'string') {
      throw new Error(`Модуль ${name}: отсутствует строковое поле 'name'`);
    }
    if (mod.name !== name) {
      throw new Error(`Имя файла модуля ${name} не совпадает с внутренним именем ${mod.name}`);
    }
    if (!Array.isArray(mod.dependencies)) {
      throw new Error(`Модуль ${name}: отсутствует или некорректный массив 'dependencies'`);
    }
    if (typeof mod.registerServices !== 'function') {
      throw new Error(`Модуль ${name}: отсутствует функция 'registerServices'`);
    }
    if (typeof mod.initialize !== 'function') {
      throw new Error(`Модуль ${name}: отсутствует функция 'initialize'`);
    }
    modules.set(name, mod);
  }
  return modules;
}

// Проверка, что все зависимости присутствуют
function validateDependencies(modulesMap) {
  for (const [name, mod] of modulesMap.entries()) {
    for (const dep of mod.dependencies) {
      if (!modulesMap.has(dep)) {
        throw new Error(`Missing required module "${dep}" for module "${name}"`);
      }
    }
  }
}

// Топологическая сортировка (алгоритм Кана)
function topologicalSort(modulesMap) {
  const inDegree = new Map();
  const graph = new Map();

  // Инициализация
  for (const [name, mod] of modulesMap.entries()) {
    inDegree.set(name, mod.dependencies.length);
    graph.set(name, []);
  }
  // Построение обратных рёбер
  for (const [name, mod] of modulesMap.entries()) {
    for (const dep of mod.dependencies) {
      graph.get(dep).push(name);
    }
  }

  const queue = [];
  for (const [name, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(name);
  }

  const order = [];
  while (queue.length) {
    const current = queue.shift();
    order.push(current);
    for (const neighbor of graph.get(current)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (order.length !== modulesMap.size) {
    // Находим цикл для понятного сообщения
    const remaining = Array.from(inDegree.entries())
      .filter(([_, deg]) => deg > 0)
      .map(([name]) => name);
    throw new Error(
      `Circular dependency detected among modules: ${remaining.join(', ')}`
    );
  }
  return order;
}

// Запуск модулей: сначала регистрация всех сервисов, потом инициализация в топологическом порядке
async function initializeModules(modulesMap, order, container) {
  // Шаг 1: регистрация сервисов (порядок не важен)
  for (const mod of modulesMap.values()) {
    mod.registerServices(container);
  }
  // Шаг 2: инициализация в порядке зависимостей
  for (const name of order) {
    const mod = modulesMap.get(name);
    await mod.initialize(container);
  }
}

// Основная функция: загрузка, валидация, сортировка, запуск
async function loadAndRun(moduleNames, modulesDir, container) {
  const modules = loadModules(moduleNames, modulesDir);
  validateDependencies(modules);
  const order = topologicalSort(modules);
  await initializeModules(modules, order, container);
  return { modules, order };
}

module.exports = {
  loadModules,
  validateDependencies,
  topologicalSort,
  initializeModules,
  loadAndRun
};