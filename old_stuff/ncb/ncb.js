import { Subscribable } from "./util.js";
import { Provider } from "./sources.js";

export { Settings, NcbController, SettingsView, ImageView };

const random = (min, max) => {
  return min + Math.floor(Math.random() * Math.floor(max - min));
};

const selectRandomElem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const Settings = () => {
  let sources = [];
  const min = Subscribable(5);
  const max = Subscribable(10);
  return {
    getSources: () => sources,
    setSources: (value) => (sources = value),
    getMin: () => min.get(),
    setMin: (value) => min.set(value),
    onMinChange: min.subscribe,
    getMax: () => max.get(),
    setMax: (value) => max.set(value),
    onMaxChange: max.subscribe,
  };
};

const NcbController = (value, autostart) => {
  const settings = value;
  const provider = Provider();
  const count = Subscribable(-1);
  const imageSrc = Subscribable("/favicon.ico");
  const displayImage = Subscribable(autostart);
  const params = new URLSearchParams(location.search);
  imageSrc.subscribe((value) => {
    count.set(count.get() + 1);
    console.log(value);
  });
  return {
    getSources: () => settings.getSources(),
    setSources: (value) => {
      settings.setSources(value);
      params.set("sources", value.join("-"));
      history.replaceState({}, null, `?${params.toString()}`);
    },
    getMin: () => settings.getMin(),
    setMin: (value) => {
      settings.setMin(value);
      params.set("min", value);
      params.set("max", settings.getMax());
      history.replaceState({}, null, `?${params.toString()}`);
    },
    onMinChange: (value) => settings.onMinChange(value),
    getMax: () => settings.getMax(),
    setMax: (value) => {
      settings.setMax(value);
      params.set("min", settings.getMin());
      params.set("max", value);
      history.replaceState({}, null, `?${params.toString()}`);
    },
    onMaxChange: (value) => settings.onMinChange(value),
    getRandomTime: (_) =>
      random(settings.getMin() * 1000, settings.getMax() * 1000),
    getAutostartUrl: () => {
      params.set("autostart", true);
      return `${location.toString().split(/[?#]/)[0]}?${params.toString()}`;
    },
    nextImage: async () =>
      imageSrc.set(await provider.getRandom(settings.getSources())),
    displayImage: () => displayImage.set(true),
    getDisplayImage: () => displayImage.get(),
    onDisplayImage: displayImage.subscribe,
    onCounterChange: count.subscribe,
    onImageSrcChange: imageSrc.subscribe,
  };
};

const SettingsView = (controller, container) => {
  const render = () => {
    container.innerHTML = `
        <div class="row">
          <div class="col-md-12">
            </br>
            <form id="settings-form">
              <div id="checkbox-list" class="form-group">
              </div>
              <div class="form-group">
                <label id="min-label" for="min">Minimum seconds to display image</label>
                <input id="min" min="5" type="range" name="min">
              </div>
              <div class="form-group">
                <label id="max-label" for="max">Maximum seconds to display image</label>
                <input id="max" max="120" type="range" name="max">
              </div>
              <br/>
              <input class="btn btn-primary btn-lg btn-block" type="submit" value="Start">
            </form>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <br/>
            <button id="autostart-button" type="button" class="btn btn-info btn-lg btn-block">Copy autostart link</button>
          </div>
        </div>`;

    const createCheckbox = (name, id) => {
      return `
        <input id="checkbox-${id}" type="checkbox" value=${id} class="form-check-input">
        <label class="form-check-label" for="checkbox-${id}">${name}</label>`;
    };

    const registerCheckbox = (checkbox, value) => {
      checkbox.checked = controller.getSources().includes(value);
      checkbox.onclick = (event) => {
        let sources = controller.getSources();
        if (checkbox.checked) {
          if (!sources.includes(value)) {
            sources.push(value);
            controller.setSources(sources);
          }
        } else {
          if (sources.includes(value)) {
            controller.setSources(sources.filter((item) => item != value));
          }
        }
      };
    };

    const checkboxList = document.querySelector("#checkbox-list");
    const checkboxes = [
      { name: "Normal Babes", id: 0 },
      { name: "Censored Babes", id: 1 },
      { name: "Normal Cocks", id: 2 },
      { name: "Animated Cocks", id: 3 },
      { name: "Censored Booru", id: 4 },
      { name: "All Girl Booru", id: 5 },
      { name: "Thh Booru", id: 6 },
      { name: "hGoon Booru", id: 7 },
      { name: "Yaoi Booru", id: 8 },
      { name: "Hentai Feet Booru", id: 9 },
      { name: "Safe Booru", id: 10 },
      { name: "Rule34", id: 11 },
      { name: "Top Heavy Hotties", id: 12 },
      { name: "Bara Booru", id: 13 },
      { name: "Foot Fetish Booru", id: 14 },
      { name: "Blacked Booru", id: 15 },
      { name: "Femdom Booru", id: 16 },
    ];
    checkboxes.forEach((item) => {
      checkboxList.innerHTML += createCheckbox(item.name, item.id);
      checkboxList.innerHTML += "</br>";
    });
    checkboxes.forEach((item) =>
      registerCheckbox(document.querySelector(`#checkbox-${item.id}`), item.id)
    );

    const form = document.querySelector("#settings-form");

    const minRange = document.querySelector("#min");
    const minLabel = document.querySelector("#min-label");
    const maxRange = document.querySelector("#max");
    const maxLabel = document.querySelector("#max-label");

    const updateRange = () => {
      minLabel.innerText = `5 - ${
        controller.getMax() - 1
      } Minimum seconds to display image ${controller.getMin()}`;
      maxLabel.innerText = `${
        controller.getMin() + 1
      } - 120 Maximum seconds to display image ${controller.getMax()}`;
    };

    minRange.max = controller.getMax() - 1;
    minRange.oninput = (_) => {
      controller.setMin(parseInt(minRange.value));
      updateRange();
      maxRange.min = controller.getMin() + 1;
    };
    minRange.value = controller.getMin();
    controller.onMinChange((_) => updateRange());

    maxRange.min = controller.getMin() + 1;
    maxRange.oninput = (_) => {
      controller.setMax(parseInt(maxRange.value));
      updateRange();
      minRange.max = controller.getMax() - 1;
    };
    maxRange.value = controller.getMax();
    controller.onMaxChange((_) => updateRange());

    form.onsubmit = (e) => {
      e.preventDefault();
      controller.displayImage();
    };

    const autostartButton = document.querySelector("#autostart-button");
    autostartButton.onclick = (_) => {
      navigator.clipboard
        .writeText(controller.getAutostartUrl())
        .then(() => console.log(controller.getAutostartUrl()));
    };
  };
  render();
};

const ImageView = (controller, container) => {
  let count = 0;
  const render = () => {
    container.innerHTML = `
    <div class="row" style="height: 90%;">
      <div class="col text-center" style="height: 100%;">
        </br>
        <h2 id="counter">Loading</h2>
        <img id="viewer" src="" class="center-block img-rounded" height="80%" style="pointer-events: none; height: 100%; max-width: 100%; object-fit: contain; border: thick solid green;">
      </div>
    </div>`;
    const counterLabel = container.querySelector("#counter");
    const viewerImage = container.querySelector("#viewer");
    controller.onCounterChange(
      (value) => (counterLabel.innerText = `Image ${value}`)
    );
    controller.onImageSrcChange((value) => {
      viewerImage.src = value;
      viewerImage.style.borderColor = Math.random() < 0.75 ? "red" : "green";
    });
  };

  const next = async () => {
    await controller.nextImage();
    setTimeout(next, controller.getRandomTime());
  };

  controller.onDisplayImage(async () => {
    if (controller.getDisplayImage() === true) {
      render();
      await next();
    }
    count++;
  });
};
