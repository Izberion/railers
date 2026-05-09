import { DiceFlowerApp } from "../apps/terrain-flower.mjs";
import { WeatherHUD } from "../apps/weather-hud.mjs";

Hooks.on("canvasReady", () => {
  WeatherHUD.showHUD();
});

let diceFlowerApp = null;

Hooks.on("getSceneControlButtons", (controls) => {
  const group = {
    name: "railersControls",
    title: game.i18n.localize("RAILERS.apps.base.railersControls"),
    icon: "fas fa-train",
    layer: "tokens",
    visible: true,
    tools: {
      terrain: {
        name: "terrain",
        title: game.i18n.localize("RAILERS.apps.terrain.openTerrainFlower"),
        icon: "fas fa-mountain",
        button: true,
        onChange: () => {
          if (diceFlowerApp?.rendered) {
            diceFlowerApp.close();
          } else {
            diceFlowerApp = new DiceFlowerApp();
            diceFlowerApp.render(true);
          }
        }
      },
      weather: {
        name: "weather",
        title: game.i18n.localize("RAILERS.apps.weather.toggleWeatherHUD"),
        icon: "fas fa-cloud-sun",
        toggle: true,
        active: true,
        onChange: () => {
          const hud = document.getElementById("railers-weather-hud");
          if (hud && hud.style.display === "flex") {
            WeatherHUD.hideHUD();
          } else {
            WeatherHUD.showHUD();
          }
        }
      },
      foreground: {
        name: "foreground",
        icon: "fas fa-circle"
      }
    },
    activeTool: "foreground",
    active: false
  };
  controls["railersControls"] = group;
});

Hooks.once("init", () => {
  game.settings.register("railers", "terrainHexStates", {
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
  game.settings.register("railers", "weatherHexStates", {
    scope: "world",
    config: false,
    type: Array,
    default: []
  });
  game.settings.register("railers", "currentWeather", {
    scope: "world",
    config: false,
    type: Object,
    default: { image: "systems/railers/assets/weather/clearhex.svg", name: "RAILERS.apps.weather.clear" }
  });
  game.settings.register("railers", "currentTemperature", {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });
  game.settings.register("railers", "currentSeason", {
    scope: "world",
    config: false,
    type: String,
    default: "summer"
  });
});