import test from "node:test";
import assert from "node:assert/strict";
import { buildOrder } from "../src/moduleLoader.js";
import { ModuleLoadError } from "../src/errors.js";

test("Порядок запуска учитывает зависимости (цепочка)", () => {
  const all = new Map();
  all.set("a", { name: "A", requires: [] });
  all.set("b", { name: "B", requires: ["A"] });
  all.set("c", { name: "C", requires: ["B"] });

  const order = buildOrder(all, ["A", "B", "C"]);
  assert.deepEqual(order.map((x) => x.name), ["A", "B", "C"]);
});

test("Порядок запуска учитывает зависимости (ветвление)", () => {
  const all = new Map();
  all.set("a", { name: "A", requires: [] });
  all.set("b", { name: "B", requires: ["A"] });
  all.set("c", { name: "C", requires: ["A"] });
  all.set("d", { name: "D", requires: ["B", "C"] });

  const order = buildOrder(all, ["A", "B", "C", "D"]).map((x) => x.name);
  assert.equal(order[0], "A");
  assert.equal(order[order.length - 1], "D");
  assert.ok(order.indexOf("B") < order.indexOf("D"));
  assert.ok(order.indexOf("C") < order.indexOf("D"));
});

test("Отсутствующий модуль даёт понятную ошибку", () => {
  const all = new Map();
  all.set("a", { name: "A", requires: [] });

  assert.throws(
    () => buildOrder(all, ["A", "B"]),
    (e) => e instanceof ModuleLoadError && e.message.includes("Модуль не найден")
  );
});

test("Отсутствующая зависимость даёт понятную ошибку", () => {
  const all = new Map();
  all.set("a", { name: "A", requires: ["B"] });
  all.set("b", { name: "B", requires: [] });

  assert.throws(
    () => buildOrder(all, ["A"]),
    (e) => e instanceof ModuleLoadError && e.message.includes("Не хватает модуля для зависимости")
  );
});

test("Цикл зависимостей обнаруживается и сообщение понятное", () => {
  const all = new Map();
  all.set("a", { name: "A", requires: ["B"] });
  all.set("b", { name: "B", requires: ["A"] });

  assert.throws(
    () => buildOrder(all, ["A", "B"]),
    (e) =>
      e instanceof ModuleLoadError &&
      e.message.toLowerCase().includes("циклическая") &&
      e.message.includes("A") &&
      e.message.includes("B")
  );
});

