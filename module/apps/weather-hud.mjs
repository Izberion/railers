import { WEATHER_TYPES, WEATHER_DATA, hexes } from "../helpers/hex-data.mjs";
import { getOrInitHexStates } from "../helpers/hex-helpers.mjs";

export class WeatherHUD {
  static async showHUD() {
    let hud = document.getElementById("railers-weather-hud");
    if (!hud) {
      hud = document.createElement("div");
      hud.id = "railers-weather-hud";
      document.body.appendChild(hud);
      await this.updateHUD(hud);
    }
    hud.style.display = "flex";
  }

  static hideHUD() {
    const hud = document.getElementById("railers-weather-hud");
    if (hud) hud.style.display = "none";
  }

  static async updateHUD(hud) {
    hud = hud || document.getElementById("railers-weather-hud");
    if (!hud) return;

    const weather = game.settings.get("railers", "currentWeather");
    const fileName = weather?.image?.split("/").pop();
    const weatherDesc = fileName ? game.i18n.localize(WEATHER_TYPES[fileName]?.desc) : "";
    const weatherName = weather?.name ? game.i18n.localize(weather.name) : "";

    let temp = game.settings.get("railers", "currentTemperature") || game.i18n.localize("RAILERS.apps.weather.clickToRoll");
    const season = game.settings.get("railers", "currentSeason") || "summer";

    // Apply Polar Outbreak modifier dynamically
    if (weather?.name === "RAILERS.apps.weather.polarOutbreak" && temp !== game.i18n.localize("RAILERS.apps.weather.clickToRoll")) {
      const tempMatch = temp.match(/-?\d+/);
      if (tempMatch) {
        const tempValue = parseInt(tempMatch[0], 10) - 20;
        temp = temp.replace(/-?\d+/, tempValue);
      }
    }

    const html = await foundry.applications.handlebars.renderTemplate(
      "systems/railers/templates/apps/weather-hud.hbs",
      {
        weather: {
          image: weather?.image,
          name: weatherName,
          desc: weatherDesc
        },
        temperature: temp,
        season: season.charAt(0).toUpperCase() + season.slice(1)
      }
    );

    hud.innerHTML = html;

    hud.querySelector(".weather").addEventListener("click", () => this.rollWeather());
    hud.querySelector(".temperature").addEventListener("click", () => this.rollTemperature());
    hud.querySelector(".season").addEventListener("click", () => this.toggleSeason());
  }

  static async rollWeather() {
    const states = getOrInitHexStates("weatherHexStates");
    const activeIndex = states.indexOf("active");
    const coordinates = WEATHER_DATA[activeIndex].coords;
    const roll = await new Roll("1d12").evaluate();

    let newWeatherEntry;
    if (roll.total % 2 === 0) {
      const index = Math.floor(roll.total / 2) - 1;
      const adjacent = hexes[coordinates];
      if (index >= 0 && index < adjacent.length) {
        const newCoords = adjacent[index];
        const newIndex = WEATHER_DATA.findIndex(w => w.coords === newCoords);
        newWeatherEntry = WEATHER_DATA[newIndex];
        states.fill("inactive");
        states[newIndex] = "active";
        game.settings.set("railers", "weatherHexStates", states);
      }
    } else {
      newWeatherEntry = WEATHER_DATA[activeIndex];
    }

    if (newWeatherEntry) {
      const fileName = newWeatherEntry.image.split("/").pop();
      const newWeather = {
        ...newWeatherEntry,
        name: WEATHER_TYPES[fileName].name  
      };
      game.settings.set("railers", "currentWeather", newWeather);
      await roll.toMessage({
        flavor: game.i18n.localize("RAILERS.apps.weather.rollWeather"),
        content: `<div class="dice-results">${game.i18n.localize(newWeather.name)}</div>`
      });
      await this.updateHUD();
    }
  }

  static async rollTemperature() {
    const season = game.settings.get("railers", "currentSeason") || "summer";
    const tableName = season === "winter" ? "Winter Temperature" : "Summer Temperature";
    const compendium = game.packs.get("railers.tables");
    const tableEntry = compendium.index.find(t => t.name === tableName);
    const rollTable = await compendium.getDocument(tableEntry._id);
    if (!rollTable) return;

    const result = await rollTable.roll();
    const temperature = result.results[0]?.description || "";
    const roll = result.roll;

    game.settings.set("railers", "currentTemperature", temperature);

    let adjustedTemperature = temperature;
    const weather = game.settings.get("railers", "currentWeather");
    if (weather?.name === "RAILERS.apps.weather.polarOutbreak" && temperature !== "") {
      const tempMatch = temperature.match(/-?\d+/);
      if (tempMatch) {
        const tempValue = parseInt(tempMatch[0], 10) - 20;
        adjustedTemperature = temperature.replace(/-?\d+/, tempValue);
      }
    }

    const content = adjustedTemperature !== temperature
      ? `<div class="dice-results">${game.i18n.format("RAILERS.apps.weather.adjustedTemperature", { adjustedTemperature })}</div>`
      : `<div class="dice-results">${temperature}</div>`;

    await roll.toMessage({
      flavor: game.i18n.localize("RAILERS.apps.weather.rollTemperature"),
      content: content
    });

    await this.updateHUD();
  }

  static async toggleSeason() {
    const currentSeason = game.settings.get("railers", "currentSeason") || "summer";
    const newSeason = currentSeason === "winter" ? "summer" : "winter";
    await game.settings.set("railers", "currentSeason", newSeason);
    await this.updateHUD();
  }
}