export { Subscribable };

const Subscribable = (v) => {
  const l = [];
  return {
    subscribe: (c) => {
      c(v, v);
      l.push(c);
    },
    set: (n) => {
      if (v === n) return;
      const oldValue = v;
      v = n;
      l.forEach((c) => c(v, oldValue));
    },
    get: () => v,
  };
};
