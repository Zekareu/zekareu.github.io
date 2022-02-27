import { Subscribable } from "./util.js";

export { Settings, NcmgController, SettingsView };

const random = (min, max) => {
  return min + Math.floor(Math.random() * Math.floor(max - min));
};

const selectRandomElem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const Settings = () => {
  const amount = Subscribable(5);
  return {
    getAmount: () => amount.get(),
    setAmount: (value) => amount.set(value),
  };
};

const NcmgController = (value) => {
  const settings = value;

  return {
    getAmount: () => settings.getAmount(),
    setAmount: (value) => {
      settings.setAmount(value);
    },
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
                <label id="amount-label" for="min">Amount: 5</label>
                <input id="amount" min="5" value=${controller.getAmount()} type="range" name="amount">
              </div>
              <br/>
              <input class="btn btn-primary btn-lg btn-block" type="submit" value="Start">
            </form>
          </div>
        </div>`;
    const form = document.querySelector("#settings-form");

    const amountRange = document.querySelector("#amount");
    const amountLabel = document.querySelector("#amount-label");

    amountRange.oninput = (_) => {
      controller.setAmount(parseInt(amountRange.value));
      amountLabel.innerText = `Amount: ${controller.getAmount()}`
    };

    form.onsubmit = (e) => {
      e.preventDefault();
      controller.displayImage();
    };
  };
  render();
};
