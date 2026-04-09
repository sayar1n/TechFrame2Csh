import fs from "node:fs/promises";
import path from "node:path";

export default {
  name: "Export",
  requires: ["Core", "Validation", "Logging"],

  register(container) {
    container.addTransient("middleware.export", (c) => ({
      title: "Экспорт",
      handle: async (ctx, next) => {
        await next();

        if (ctx.url.pathname !== "/process") return;
        if (ctx.res.writableEnded) return;

        const out = path.resolve(process.cwd(), "export.txt");
        const line = `requestId=${ctx.requestId} name=${ctx.state.name}\n`;
        await fs.appendFile(out, line, "utf8");
        c.get("logger").log(ctx, `export appended to ${path.basename(out)}`);
      }
    }));
  },

  async init() {}
};

