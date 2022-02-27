import { Observable, Random } from "../util.js";

export { Controller, SettingsView, ImageView };

const Controller = (settings) => {
  const sources = Observable(settings.sources);
  const go = Observable(true);
  const time = Observable(settings.time);
  const sound = Observable(settings.sound)
  const src = Observable("");

  let loader = null;

  const loadNextImage = (selectedSources) => {
    loader.nextImage((image) => {
      src.set(image);
      go.set(Math.random() < 0.75);
      setTimeout(() => {
        loadNextImage(selectedSources);
      }, time.get() * 1000);
    });
  }

  time.subscribe(value => {
    settings.params.set("time", value);
    history.replaceState({}, null, `?${settings.params.toString()}`);
  });

  return {
    sources: sources,
    time: time,
    sound: sound,
    toggleSource: (source, value) => {
      source.use = value,
      settings.params.set("sources", sources.get()
      .filter(s => s.use)
      .map(o => o.id).join("-"));
      history.replaceState({}, null, `?${settings.params.toString()}`);
    },
    toggleSound: (value) => {
      sound.set(value);
      settings.params.set("sound", sound.get());
      history.replaceState({}, null, `?${settings.params.toString()}`);
    },
    start: (imageHandler, goHandler) => {
      let selectedSources = sources.get().filter(source => source.use);
      if(selectedSources.length == 0) {
        selectedSources = sources;
      }
      loader = SourceLoader(selectedSources);
      loadNextImage(selectedSources);
      src.subscribe(imageHandler);
      go.subscribe(goHandler);
    },
    getAutostartUrl: () => {
      settings.params.set("autostart", true);
      return `${location.toString().split(/[?#]/)[0]}?${settings.params.toString()}`;
    },
  };
};

const SourceLoader = (sources) => {
  const rng = Random();
  const cache = [];

  let index = rng.next(0, 300000); //Prevent caching

  const booruLoader = (source, callback) => {
    index++;
    fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(
        source.url
      )}&${index}`
    )
    .then(res => res.json())
    .then(data => {
      callback(new DOMParser()
        .parseFromString(data["contents"], "text/html")
        .getElementById(source.container).src);
    })
    .catch(err => console.error(err));
  }

  const listLoader = (source, callback) => {
    fetch(source.url)
    .then(res => res.json())
    .then(data => {
      if(cache.includes(element => element.id == source.id)) {
        data = cache[cache.indexOf(element => element.id == source.id)];
      } else {
        cache.push({
          id: source.id,
          data: data
        });
      }
      callback(rng.selectRandomElement(data));
    })
    .catch(err => console.error(err));
  }

  return {
    nextImage: (callback) => {
      const source = rng.selectRandomElement(sources);
      switch (source.type) {
        case "booru":
          booruLoader(source, callback);
          break;
        default:
          listLoader(source, callback);
          break;
      }
    }
  }
}

const SettingsView = (controller, container) => {
  const createCheckbox = (source) => {
    return `
      <input id="checkbox-${source.id}" type="checkbox" value=${source.name} class="form-check-input" ${source.use ? "checked" : ""}>
      <label class="form-check-label" for="checkbox-${source.id}">${source.name}</label></br>`;
  };

  const registerCheckbox = (source) =>  {
    const checkbox = document.querySelector(`#checkbox-${source.id}`);
    checkbox.onclick = () => {
      controller.toggleSource(source, checkbox.checked);
    }
  };

  const render = (container) => {
    let html = `
      <div class="row">
        <div class="col-md-12">
          </br>
          <form id="settings-form">
            <div class="form-group">`
    for (const source of controller.sources.get()) {
      html += createCheckbox(source);
    }
    html += `</div>
            <div class="form-group">
              <label id="time-label" for="time"></label>
              <input id="time" min="5" max="60" type="range" name="time">
            </div>
            <div class="form-group">
              <label class="form-check-label" for="checkbox-sound">Sound</label>
              <input id="sound" type="checkbox" class="form-check-input" ${controller.sound.get() ? "checked" : ""}>
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
    container.innerHTML = html;
  }
  render(container);

  const timeRange = document.querySelector("#time");
  const timeLabel = document.querySelector("#time-label");
  const soundCheckbox = document.querySelector("#sound");

  timeRange.value = controller.time.get();
  timeRange.oninput = () => {
    controller.time.set(parseInt(timeRange.value));
  };

  soundCheckbox.onclick = () => {
    controller.toggleSound(soundCheckbox.checked);
  };

  controller.time.subscribe((value) => {
    timeLabel.innerText = `Time to display image ${value}`;
  });

  for (const source of controller.sources.get()) {
    registerCheckbox(source);
  }

  const form = document.querySelector("#settings-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    ImageView(controller, container);
  };

  const autostartButton = document.querySelector("#autostart-button");
  autostartButton.onclick = () => {
    navigator.clipboard
      .writeText(controller.getAutostartUrl())
      .then(() => console.log(controller.getAutostartUrl()));
  };
}

const ImageView = (controller, container) => {
  const render = (container) => {
    container.innerHTML = `
      <div class="row" style="height: 90%;">
        <div class="col text-center" style="height: 100%;">
          </br>
          <h2 id="counter" style="opacity: 0;">Loading</h2>
          <img id="viewer" src="" class="center-block img-rounded" style="opacity: 0; pointer-events: none; height: 100%; max-width: 100%; object-fit: contain; border: thick solid green;">
        </div>
      </div>`;
  }
  render(container);
  const viewer = document.getElementById("viewer");
  const counterLabel = container.querySelector("#counter");
  const sound = new Audio("data:audio/mp3;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
  const rng = Random();

  let count = -1; // Subscribe will increase by one
  let metronome = null;

  controller.start((src) => {
    console.log(src);
    viewer.src = src;
    count++;
    counterLabel.innerText = count;
    if(count == 1) {
      counterLabel.style.opacity = 1;
      viewer.style.opacity = 1;
    }
  },
  (go) => {
    viewer.style.borderColor = go ? "green" : "red";
    if(go && controller.sound.get()) {
      console.log("set");
      metronome = setInterval(() => {
        sound.currentTime = 0;
        sound.play();
      }, rng.next(100, 1000))
    } else {
      console.log("clear");
      clearInterval(metronome);
      metronome = null;
    }
  });
}
