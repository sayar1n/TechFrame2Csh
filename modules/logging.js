export default {
  name: "Logging",
  requires: ["Core"],

  register(container) {
    container.addSingleton("logger", (c) => ({
      log: (ctx, msg) => {
        const ts = c.get("clock").now();
        ctx.logs.push(`[${ts}] ${msg}`);
      }
    }));

    container.addTransient("middleware.logging", (c) => ({
      title: "Логирование",
      handle: async (ctx, next) => {
        const logger = c.get("logger");
        logger.log(ctx, `start requestId=${ctx.requestId} path=${ctx.url.pathname}`);
        await next();
        logger.log(ctx, `end requestId=${ctx.requestId} status=${ctx.res.statusCode}`);
      }
    }));
  },

  async init() {}
};

