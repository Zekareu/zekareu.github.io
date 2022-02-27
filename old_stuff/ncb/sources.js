export { Provider };

const selectRandomElem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const random = (min, max) => {
  return min + Math.floor(Math.random() * Math.floor(max - min));
};

const Provider = () => {
  let index = random(0, 300000); //Prevent caching
  const booruFetcher = async (booruUrl) => {
    index++;
    const res = await fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(
        booruUrl
      )}&${index}`
    );
    return new DOMParser()
      .parseFromString((await res.json())["contents"], "text/html")
      .getElementById("image").src;
  };

  const normalBabes = async () => {
    const res = await fetch("/api/bc.json");
    return (await res.json())["babes"]["normal"];
  };

  const censoredBabes = async () => {
    const res = await fetch("/api/bc.json");
    return (await res.json())["babes"]["censored"];
  };

  const normalCocks = async () => {
    const res = await fetch("/api/bc.json");
    return (await res.json())["cocks"]["normal"];
  };

  const animatedCocks = async () => {
    const res = await fetch("/api/bc.json");
    return (await res.json())["cocks"]["animated"];
  };

  return {
    getRandom: async (sources) => {
      switch (selectRandomElem(sources)) {
        case 0:
          return selectRandomElem(await normalBabes());
        case 1:
          return selectRandomElem(await censoredBabes());
        case 2:
          return selectRandomElem(await normalCocks());
        case 3:
          return selectRandomElem(await animatedCocks());
        case 4:
          return await booruFetcher(
            "https://censored.booru.org/index.php?page=post&s=random"
          );
        case 5:
          return await booruFetcher(
            "https://allgirl.booru.org/index.php?page=post&s=random"
          );
        case 6:
          return await booruFetcher(
            "https://thh.booru.org/index.php?page=post&s=random"
          );
        case 7:
          return await booruFetcher(
            "https://hgoon.booru.org/index.php?page=post&s=random"
          );
        case 8:
          return await booruFetcher(
            "https://yaoi.booru.org/index.php?page=post&s=random"
          );
        case 9:
          return await booruFetcher(
            "https://sexyhentaifeet.booru.org/index.php?page=post&s=random"
          );
        case 10:
          return await booruFetcher(
            "https://safebooru.org/index.php?page=post&s=random"
          );
        case 11:
          return await booruFetcher(
            "https://rule34.xxx/index.php?page=post&s=random"
          )
        case 12:
          return await booruFetcher(
            "https://thh.booru.org/index.php?page=post&s=random"
          )
        case 13:
          return await booruFetcher(
            "https://bara.booru.org/index.php?page=post&s=random"
          )
        case 14:
          return await booruFetcher(
            "https://footfetishbooru.booru.org/index.php?page=post&s=random"
          )
        case 15:
          return await booruFetcher(
            "https://blacked.booru.org/index.php?page=post&s=random"
          )
        case 16:
          return await booruFetcher(
            "https://dominatrix.booru.org/index.php?page=post&s=random"
          )
        default:
          break;
      }
    },
  };
};
