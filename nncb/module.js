import { Controller, SettingsView, ImageView } from "./nncb.js";

const params = new URLSearchParams(location.search);

const autostartParam = params.get("autostart");
const sourcesParam = params.get("sources");
const timeParam = params.get("time");
const soundParam = params.get("sound");

fetch("/api/nncb/sources.json")
.then(res => res.json())
.then(data => {
  const sources = [];
  for (const source of data) {
    source.id = sources.length;
    source.use = false;
    sources.push(source);
  }
  const settings = {
    sources: sources,
    time: timeParam ?? 10,
    sound: (soundParam ?? "true").toLowerCase() === true.toString(),
    params: params
  }

  if(sourcesParam != null && sourcesParam != "") {
    for (const sourceId of sourcesParam.split('-')) {
      settings.sources[sourceId].use = true;
    }
  }


  if(autostartParam) {
    const controller = Controller(settings);
    ImageView(controller, document.getElementById("container"))
  } else {
    settings.sources.sort((a, b) => a.name.localeCompare(b.name));
    SettingsView(Controller(settings), document.getElementById("container"));
  }
});
