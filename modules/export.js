module.exports = {
    name: 'export',
    dependencies: ['report', 'logger'],
    registerServices(container) {
      container.register('exporter', (c) => ({
        exportToFile: (data, filename) => {
          const reportGen = c.resolve('reportGenerator');
          const logger = c.resolve('logger');
          const report = reportGen.generate(data);
          logger.log(`Экспортируем в ${filename}`);
          // Имитация записи в файл
          console.log(`[ФАЙЛ] Записываем в ${filename}: ${report}`);
        }
      }));
    },
    async initialize(container) {
      const logger = container.resolve('logger');
      logger.log('Модуль экспорта инициализирован');
      // Демонстрация: экспортируем тестовые данные
      const exporter = container.resolve('exporter');
      exporter.exportToFile({ userId: 42, items: ['apple', 'banana'] }, 'order.json');
    }
  };