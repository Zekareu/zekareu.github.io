export { Observable, Random };

const Observable = (v) => {
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

const Random = () => {
  const shuffle = (array) => {
    let c = array.length;
    while (c > 0) {
      let i = Math.floor(Math.random() * counter);
      c--;
      let temp = array[c];
      array[c] = array[i];
      array[i] = temp;
    }
    return array;
  };

  return {
    next: (min, max) => min + Math.floor(Math.random() * Math.floor(max - min)),
    selectRandomElement: (array) => {
      return array[Math.floor(Math.random() * array.length)];
    },
    selectRandomElements: (array, amount) => {
      if (amount > array.length) {
        return shuffle(array);
      } else {
        return shuffle(array).slice(0, nrOfElements);
      }
    },
    shuffle: shuffle
  }
}