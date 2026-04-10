const { Container } = require('./core/container');
const { loadAndRun } = require('./core/moduleLoader');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = './config.json';
const MODULES_DIR = path.join(__dirname, 'modules');

async function main() {
  try {
    // Читаем список модулей из конфига
    if (!fs.existsSync(CONFIG_PATH)) {
      throw new Error(`Файл конфигурации не найден: ${CONFIG_PATH}`);
    }
    const moduleNames = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    if (!Array.isArray(moduleNames)) {
      throw new Error('Конфиг должен содержать массив имен модулей');
    }

    const container = new Container();
    console.log('Запускаем приложение...');
    const { modules, order } = await loadAndRun(moduleNames, MODULES_DIR, container);
    console.log(`Инициализация завершена. Порядок: ${order.join(' -> ')}`);
  } catch (err) {
    console.error('ОШИБКА:', err.message);
    process.exit(1);
  }
}

main();