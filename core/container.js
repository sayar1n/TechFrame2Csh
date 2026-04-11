class Container {
    constructor() {
      this.registrations = new Map(); // регистрация сервисов
      this.instances = new Map();       // экземпляры сервисов
    }
  
    // Зарегистрировать сервис (ядро получает контейнер для разрешения своих зависимостей из модулей)
    register(name, factory) {
      if (this.registrations.has(name)) {
        throw new Error(`Сервис "${name}" уже зарегистрирован`);
      }
      this.registrations.set(name, factory);
    }
  
    // Получить экземпляр сервиса (создаёт при первом обращении)
    resolve(name) {
      if (this.instances.has(name)) {
        return this.instances.get(name);
      }
      const factory = this.registrations.get(name);
      if (!factory) {
        throw new Error(`Сервис "${name}" не зарегистрирован`);
      }
      const instance = factory(this);
      this.instances.set(name, instance);
      return instance;
    }
  
    // Проверить, зарегистрирован ли сервис
    has(name) {
      return this.registrations.has(name);
    }
  }
  
  module.exports = { Container };