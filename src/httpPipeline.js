export function composePipeline(steps) {
  const list = Array.isArray(steps) ? steps.slice() : [];

  return async function run(ctx) {
    let idx = -1;
    async function dispatch(i) {
      if (i <= idx) throw new Error("next() вызван более одного раза");
      idx = i;
      const step = list[i];
      if (!step) return;
      await step.handle(ctx, () => dispatch(i + 1));
    }
    await dispatch(0);
  };
}

