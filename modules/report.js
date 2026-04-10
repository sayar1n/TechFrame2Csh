module.exports = {
    name: 'report',
    dependencies: ['logger'],
    registerServices(container) {
      container.register('reportGenerator', (c) => ({
        generate: (data) => {
          const logger = c.resolve('logger');
          logger.log('Генерируем отчёт');
          return `Отчёт: ${JSON.stringify(data)}`;
        }
      }));
    },
    async initialize(container) {
      const logger = container.resolve('logger');
      logger.log('Модуль отчёта инициализирован');
    }
  };