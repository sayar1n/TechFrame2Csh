module.exports = {
    name: 'logger',
    dependencies: [],
    registerServices(container) {
      container.register('logger', () => ({
        log: (msg) => console.log(`[LOG] ${msg}`)
      }));
    },
    async initialize(container) {
      const logger = container.resolve('logger');
      logger.log('Модуль логирования иницилизирован');
    }
  };