import { Settings, ImageView, NcbController, SettingsView } from "./ncb.js";

const params = new URLSearchParams(location.search);

const autostart = params.get("autostart");
const sources = params.get("sources");
const min = params.get("min");
const max = params.get("max");
const settings = Settings();
if (sources != undefined) {
  if (sources.length > 0) {
    settings.setSources(sources.split("-").map((x) => parseInt(x)));
  }
}
if (min != undefined && max != undefined) {
  if (parseInt(min) < parseInt(max)) {
    settings.setMin(parseInt(min));
    settings.setMax(parseInt(max));
  } else {
    alert("Min must be smaller than max");
  }
}

const controller = NcbController(settings, autostart === "true");

SettingsView(controller, document.getElementById("container"));
ImageView(controller, document.getElementById("container"));
