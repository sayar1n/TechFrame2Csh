import path from "node:path";
import { fileURLToPath } from "node:url";
import { Container } from "./container.js";
import { loadModulesFromConfig, buildOrder } from "./moduleLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, "..", "config", "modules.json");
const modulesDir = path.resolve(__dirname, "..", "modules");

const all = await loadModulesFromConfig(configPath, modulesDir);

const enabledNames = [];
for (const [, m] of all) enabledNames.push(m.name);

const ordered = buildOrder(all, enabledNames);

const container = new Container();

for (const m of ordered) {
  if (typeof m.register === "function") {
    m.register(container);
  }
}

for (const m of ordered) {
  if (typeof m.init === "function") {
    await m.init(container);
  }
}

const actions = container.getMany("action.");
for (const act of actions) {
  await act.execute();
}

