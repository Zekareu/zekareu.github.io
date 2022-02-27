import { Settings, NcmgController, SettingsView } from "./ncmg.js";

const controller = NcmgController(Settings());

SettingsView(controller, document.getElementById("container"));
