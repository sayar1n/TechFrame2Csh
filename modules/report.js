export default {
  name: "Report",
  requires: ["Core", "Logging"],

  register(container) {
    container.addSingleton("stats", () => ({ processed: 0 }));

    container.addTransient("middleware.report", (c) => ({
      title: "Отчёт",
      handle: async (ctx, next) => {
        await next();
        if (ctx.url.pathname !== "/process") return;
        if (ctx.res.writableEnded) return;
        c.get("stats").processed += 1;
        c.get("logger").log(ctx, `stats.processed=${c.get("stats").processed}`);
      }
    }));

    container.addSingleton("action.report", (c) => ({
      title: "Показать счётчик обработок",
      execute: async () => {
        const s = c.get("stats");
        console.log(`Счётчик обработок /process: ${s.processed}`);
      }
    }));
  },

  async init() {}
};

