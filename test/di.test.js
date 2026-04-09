import test from "node:test";
import assert from "node:assert/strict";
import { Container } from "../src/container.js";

test("DI: singleton возвращает один и тот же объект", () => {
  const c = new Container();
  c.addSingleton("x", () => ({ v: Math.random() }));
  const a = c.get("x");
  const b = c.get("x");
  assert.equal(a, b);
});

test("DI: transient возвращает разные объекты", () => {
  const c = new Container();
  c.addTransient("x", () => ({ v: Math.random() }));
  const a = c.get("x");
  const b = c.get("x");
  assert.notEqual(a, b);
});

test("Зависимости реально внедряются контейнером, а не создаются вручную", () => {
  const c = new Container();

  c.addSingleton("dep", () => ({ marker: "from-container" }));
  c.addTransient("service", (cc) => ({ dep: cc.get("dep") }));

  const s = c.get("service");
  assert.equal(s.dep.marker, "from-container");
  assert.equal(s.dep, c.get("dep"));
});

