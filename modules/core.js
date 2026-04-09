import http from "node:http";
import { composePipeline } from "../src/httpPipeline.js";

export default {
  name: "Core",
  requires: [],

  register(container) {
    container.addSingleton("clock", () => ({ now: () => new Date().toISOString() }));

    container.addSingleton("requestId", () => {
      let n = 0;
      return { next: () => ++n };
    });

    container.addSingleton("http.server", (c) => {
      const pipeline = composePipeline(c.getMany("middleware."));

      return http.createServer(async (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const ctx = {
          req,
          res,
          url,
          state: {},
          logs: [],
          requestId: c.get("requestId").next()
        };

        try {
          await pipeline(ctx);
          if (res.writableEnded) return;

          res.statusCode = 200;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: true, requestId: ctx.requestId, state: ctx.state, logs: ctx.logs }));
        } catch (e) {
          if (res.writableEnded) return;
          res.statusCode = 500;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ ok: false, error: String(e?.message ?? e) }));
        }
      });
    });

    container.addSingleton("action.server", (c) => ({
      title: "Запуск HTTP сервера",
      execute: async () => {
        const server = c.get("http.server");
        const port = Number.parseInt(process.env.PORT ?? "3000", 10);
        await new Promise((resolve, reject) => {
          server.once("error", reject);
          server.listen(port, () => {
            server.off("error", reject);
            resolve();
          });
        }).catch((e) => {
          if (e?.code === "EADDRINUSE") {
            throw new Error(
              `Порт ${port} уже занят. Освободите порт или запустите так: PORT=3001 npm start`
            );
          }
          throw e;
        });
        console.log(`Сервер запущен на порту ${port}`);
        console.log("Пример: GET /process?name=Иван");
      }
    }));
  },

  async init() {}
};

