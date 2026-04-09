export default {
  name: "Validation",
  requires: ["Core", "Logging"],

  register(container) {
    container.addTransient("middleware.validation", (c) => ({
      title: "Валидация",
      handle: async (ctx, next) => {
        if (ctx.url.pathname !== "/process") {
          await next();
          return;
        }

        const name = (ctx.url.searchParams.get("name") ?? "").trim();
        if (!name) {
          c.get("logger").log(ctx, "validation failed: empty name");
          ctx.res.statusCode = 400;
          ctx.res.setHeader("content-type", "application/json; charset=utf-8");
          ctx.res.end(JSON.stringify({ ok: false, error: "Параметр name обязателен" }));
          return;
        }

        ctx.state.name = name;
        await next();
      }
    }));
  },

  async init() {}
};

