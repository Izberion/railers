// No import needed; use global foundry namespace

// Shared hex adjacency map for terrain and weather (5x5 grid, 19 hexes)
export const hexes = {
  "(0,0)": ["(1,0)", "(1,1)", "(0,1)", "(2,0)", "(4,2)", "(0,2)"],
  "(0,1)": ["(1,1)", "(1,2)", "(0,2)", "(3,0)", "(3,3)", "(0,0)"],
  "(0,2)": ["(1,2)", "(1,3)", "(0,0)", "(4,0)", "(2,4)", "(0,1)"],
  "(1,0)": ["(2,0)", "(2,1)", "(1,1)", "(0,0)", "(4,1)", "(1,3)"],
  "(1,1)": ["(2,1)", "(2,2)", "(1,2)", "(0,1)", "(0,0)", "(1,0)"],
  "(1,2)": ["(2,2)", "(2,3)", "(1,3)", "(0,2)", "(0,1)", "(1,1)"],
  "(1,3)": ["(2,3)", "(2,4)", "(1,0)", "(4,1)", "(0,2)", "(1,2)"],
  "(2,0)": ["(0,0)", "(3,0)", "(2,1)", "(1,0)", "(4,0)", "(2,4)"],
  "(2,1)": ["(3,0)", "(3,1)", "(2,2)", "(1,1)", "(1,0)", "(2,0)"],
  "(2,2)": ["(3,1)", "(3,2)", "(2,3)", "(1,2)", "(1,1)", "(2,1)"],
  "(2,3)": ["(3,2)", "(3,3)", "(2,4)", "(1,3)", "(1,2)", "(2,2)"],
  "(2,4)": ["(3,3)", "(3,0)", "(0,2)", "(2,0)", "(1,3)", "(2,3)"],
  "(3,0)": ["(0,1)", "(4,0)", "(3,1)", "(2,1)", "(2,0)", "(3,3)"],
  "(3,1)": ["(4,0)", "(4,1)", "(3,2)", "(2,2)", "(2,1)", "(3,0)"],
  "(3,2)": ["(4,1)", "(4,2)", "(3,3)", "(2,3)", "(2,2)", "(3,1)"],
  "(3,3)": ["(4,2)", "(0,1)", "(3,0)", "(2,4)", "(2,3)", "(3,2)"],
  "(4,0)": ["(0,2)", "(2,0)", "(4,1)", "(3,1)", "(3,0)", "(4,2)"],
  "(4,1)": ["(1,3)", "(1,0)", "(4,2)", "(3,2)", "(3,1)", "(4,0)"],
  "(4,2)": ["(2,4)", "(0,0)", "(4,0)", "(3,3)", "(3,2)", "(4,1)"]
};

// Terrain Dice Flower ApplicationV2
export class DiceFlowerApp extends foundry.applications.api.ApplicationV2 {
  static get defaultOptions() {
      return foundry.utils.mergeObject(super.defaultOptions, {
          id: "dice-flower-app",
          classes: ["railers", "dice-flower"],
          title: game.i18n.localize("RAILERS.DiceFlower"),
          width: 400,
          height: 500,
          resizable: true,
          template: "systems/railers/templates/dice-flower.hbs"
      });
  }

  async getData() {
      return { hexes: this._getHexData() };
  }

  _getHexData() {
      const hexData = [
          { coords: "(0,0)", src: "systems/railers/assets/tiles/snowhex.svg" },
          { coords: "(0,1)", src: "systems/railers/assets/tiles/hillhex.svg" },
          { coords: "(0,2)", src: "systems/railers/assets/tiles/icehex.svg" },
          { coords: "(1,0)", src: "systems/railers/assets/tiles/hillhex.svg" },
          { coords: "(1,1)", src: "systems/railers/assets/tiles/flathex.svg" },
          { coords: "(1,2)", src: "systems/railers/assets/tiles/flathex.svg" },
          { coords: "(1,3)", src: "systems/railers/assets/tiles/mountainhex.svg" },
          { coords: "(2,0)", src: "systems/railers/assets/tiles/mountainhex.svg" },
          { coords: "(2,1)", src: "systems/railers/assets/tiles/flathex.svg" },
          { coords: "(2,2)", src: "systems/railers/assets/tiles/flathex.svg" },
          { coords: "(2,3)", src: "systems/railers/assets/tiles/flathex.svg" },
          { coords: "(2,4)", src: "systems/railers/assets/tiles/mountainhex.svg" },
          { coords: "(3,0)", src: "systems/railers/assets/tiles/hillhex.svg" },
          { coords: "(3,1)", src: "systems/railers/assets/tiles/flathex.svg" },
          { coords: "(3,2)", src: "systems/railers/assets/tiles/flathex.svg" },
          { coords: "(3,3)", src: "systems/railers/assets/tiles/hillhex.svg" },
          { coords: "(4,0)", src: "systems/railers/assets/tiles/snowhex.svg" },
          { coords: "(4,1)", src: "systems/railers/assets/tiles/hillhex.svg" },
          { coords: "(4,2)", src: "systems/railers/assets/tiles/icehex.svg" }
      ];
      const hexStates = this._getHexStates("terrainHexStates");
      return hexData.map((hex, i) => ({ ...hex, state: hexStates[i] || "inactive" }));
  }

  _getHexStates(settingKey) {
      const storedStates = game.settings.get("railers", settingKey);
      if (!storedStates || storedStates.length !== 19) {
          const states = Array(19).fill("inactive");
          states[9] = "active"; // Center (2,2)
          game.settings.set("railers", settingKey, states);
          return states;
      }
      return storedStates;
  }

  activateListeners(html) {
      super.activateListeners(html);
      html.find(".d12hex").on("click", (event) => this._handleRoll(event, html));
      html.find(".hex").on("click", (event) => this._handleHexClick(event, html));
      html.find(".draggable-hex").on("dragstart", this._onDragStart.bind(this));
  }

  _onDragStart(event) {
      if (!event.target.classList.contains("draggable-hex")) return;
      const tileData = {
          texture: { src: event.target.src },
          width: 120,
          height: 105,
          x: 0,
          y: 0,
          z: 0,
          rotation: 0,
          hidden: false,
          locked: false
      };
      event.dataTransfer.setData("text/plain", JSON.stringify(tileData));
  }

  async _onDrop(event) {
      event.preventDefault();
      const data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (!data?.texture?.src) return;

      const scenePos = canvas.stage.toLocal({ x: event.clientX, y: event.clientY });
      const snapped = (canvas.grid.type > CONST.GRID_TYPES.GRIDLESS && canvas.grid.isHexagonal)
          ? canvas.grid.getSnappedPoint(
              { x: scenePos.x, y: scenePos.y },
              { mode: CONST.GRID_SNAPPING_MODES.CENTER, resolution: 1 }
          )
          : { x: scenePos.x, y: scenePos.y };

      data.x = snapped.x - 60 + 2;
      data.y = snapped.y - 50;
      data.locked = true;

      await canvas.scene.createEmbeddedDocuments("Tile", [data]);
  }

  async _handleRoll(event, html) {
      const roll = await new Roll("1d12").evaluate();
      const coordinates = html.find(".hex.active").data("coordinates");
      const terrainTypes = {
          "snowhex.svg": game.i18n.localize("RAILERS.SnowTerrain"),
          "hillhex.svg": game.i18n.localize("RAILERS.HillTerrain"),
          "icehex.svg": game.i18n.localize("RAILERS.IceTerrain"),
          "flathex.svg": game.i18n.localize("RAILERS.FlatTerrain"),
          "mountainhex.svg": game.i18n.localize("RAILERS.MountainTerrain")
      };

      const imgSrc = html.find(`.hex[data-coordinates="${coordinates}"] img`).attr("src");
      const fileName = imgSrc.split("/").pop();
      const terrainType = terrainTypes[fileName] || "Unknown";

      if (roll.total % 2 === 0) {
          const index = Math.floor(roll.total / 2) - 1;
          const adjacentHexes = hexes[coordinates];
          if (index < 0 || index >= adjacentHexes.length) return;

          const newCoordinates = adjacentHexes[index];
          const newHex = html.find(`.hex[data-coordinates="${newCoordinates}"]`);
          const newImgSrc = newHex.find("img").attr("src");
          const newFileName = newImgSrc.split("/").pop();
          const newTerrainType = terrainTypes[newFileName] || "Unknown";

          await roll.toMessage({
              flavor: game.i18n.localize("RAILERS.RollTerrainFlower"),
              content: `<div class="dice-results">${newTerrainType}</div>`
          });

          this._updateHexStates(html, newCoordinates, "terrainHexStates");
      } else {
          await roll.toMessage({
              flavor: game.i18n.localize("RAILERS.RollTerrainFlower"),
              content: `<div class="dice-results">${terrainType}</div>`
          });
      }
  }

  _handleHexClick(event, html) {
      const coordinates = $(event.currentTarget).data("coordinates");
      this._updateHexStates(html, coordinates, "terrainHexStates");
  }

  _updateHexStates(html, activeCoordinates, settingKey) {
      const hexesElements = html.find(".hex");
      const hexStates = Array(hexesElements.length).fill("inactive");
      const activeIndex = hexesElements.index(html.find(`.hex[data-coordinates="${activeCoordinates}"]`));
      hexStates[activeIndex] = "active";

      hexesElements.removeClass("active inactive").each((i, h) => h.classList.add(hexStates[i]));
      game.settings.set("railers", settingKey, hexStates);
  }
}

// Weather and Temperature HUD Logic
export class WeatherHUD {
  static async showHUD() {
      let hud = document.getElementById("railers-weather-hud");
      if (!hud) {
          hud = document.createElement("div");
          hud.id = "railers-weather-hud";
          hud.style.cssText = `
              position: absolute;
              top: 10px;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              gap: 10px;
              background: rgba(0, 0, 0, 0.8);
              padding: 5px 10px;
              border-radius: 5px;
              color: white;
              z-index: 100;
          `;
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
      const temp = game.settings.get("railers", "currentTemperature");
      hud.innerHTML = `
          <div class="weather clickable" style="cursor: pointer;">
              <img src="${weather.image}" style="width: 30px; height: 30px;"> ${weather.name}
          </div>
          <div class="temperature clickable" style="cursor: pointer;">
              ${temp || "N/A"}
          </div>
      `;
      hud.querySelector(".weather").addEventListener("click", () => this.rollWeather());
      hud.querySelector(".temperature").addEventListener("click", () => this.rollTemperature());
  }

  static async rollWeather() {
      const weatherTypes = {
          "thundersnowhex.svg": game.i18n.localize("RAILERS.ThunderSnow"),
          "snowstormhex.svg": game.i18n.localize("RAILERS.SnowStorm"),
          "blizzardhex.svg": game.i18n.localize("RAILERS.Blizzard"),
          "windhex.svg": game.i18n.localize("RAILERS.Wind"),
          "flurryhex.svg": game.i18n.localize("RAILERS.Flurry"),
          "overcasthex.svg": game.i18n.localize("RAILERS.Overcast"),
          "polaroutbreakhex.svg": game.i18n.localize("RAILERS.PolarOutbreak"),
          "aurorahex.svg": game.i18n.localize("RAILERS.Aurora"),
          "clearhex.svg": game.i18n.localize("RAILERS.Clear"),
          "icefoghex.svg": game.i18n.localize("RAILERS.IceFog"),
          "diamonddusthex.svg": game.i18n.localize("RAILERS.DiamondDust"),
          "whiteouthex.svg": game.i18n.localize("RAILERS.Whiteout")
      };
      const weatherData = [
          { coords: "(0,0)", image: "systems/railers/assets/weather/thundersnowhex.svg", name: weatherTypes["thundersnowhex.svg"] },
          { coords: "(0,1)", image: "systems/railers/assets/weather/snowstormhex.svg", name: weatherTypes["snowstormhex.svg"] },
          { coords: "(0,2)", image: "systems/railers/assets/weather/blizzardhex.svg", name: weatherTypes["blizzardhex.svg"] },
          { coords: "(1,0)", image: "systems/railers/assets/weather/windhex.svg", name: weatherTypes["windhex.svg"] },
          { coords: "(1,1)", image: "systems/railers/assets/weather/flurryhex.svg", name: weatherTypes["flurryhex.svg"] },
          { coords: "(1,2)", image: "systems/railers/assets/weather/overcasthex.svg", name: weatherTypes["overcasthex.svg"] },
          { coords: "(1,3)", image: "systems/railers/assets/weather/polaroutbreakhex.svg", name: weatherTypes["polaroutbreakhex.svg"] },
          { coords: "(2,0)", image: "systems/railers/assets/weather/aurorahex.svg", name: weatherTypes["aurorahex.svg"] },
          { coords: "(2,1)", image: "systems/railers/assets/weather/clearhex.svg", name: weatherTypes["clearhex.svg"] },
          { coords: "(2,2)", image: "systems/railers/assets/weather/clearhex.svg", name: weatherTypes["clearhex.svg"] },
          { coords: "(2,3)", image: "systems/railers/assets/weather/clearhex.svg", name: weatherTypes["clearhex.svg"] },
          { coords: "(2,4)", image: "systems/railers/assets/weather/icefoghex.svg", name: weatherTypes["icefoghex.svg"] },
          { coords: "(3,0)", image: "systems/railers/assets/weather/blizzardhex.svg", name: weatherTypes["blizzardhex.svg"] },
          { coords: "(3,1)", image: "systems/railers/assets/weather/overcasthex.svg", name: weatherTypes["overcasthex.svg"] },
          { coords: "(3,2)", image: "systems/railers/assets/weather/flurryhex.svg", name: weatherTypes["flurryhex.svg"] },
          { coords: "(3,3)", image: "systems/railers/assets/weather/windhex.svg", name: weatherTypes["windhex.svg"] },
          { coords: "(4,0)", image: "systems/railers/assets/weather/diamonddusthex.svg", name: weatherTypes["diamonddusthex.svg"] },
          { coords: "(4,1)", image: "systems/railers/assets/weather/snowstormhex.svg", name: weatherTypes["snowstormhex.svg"] },
          { coords: "(4,2)", image: "systems/railers/assets/weather/whiteouthex.svg", name: weatherTypes["whiteouthex.svg"] }
      ];

      const states = this._getHexStates("weatherHexStates");
      const activeIndex = states.indexOf("active");
      const coordinates = weatherData[activeIndex].coords;
      const roll = await new Roll("1d12").evaluate();

      let newWeather;
      if (roll.total % 2 === 0) {
          const index = Math.floor(roll.total / 2) - 1;
          const adjacent = hexes[coordinates];
          if (index >= 0 && index < adjacent.length) {
              const newCoords = adjacent[index];
              const newIndex = weatherData.findIndex(w => w.coords === newCoords);
              newWeather = weatherData[newIndex];
              states.fill("inactive");
              states[newIndex] = "active";
              game.settings.set("railers", "weatherHexStates", states);
          }
      } else {
          newWeather = weatherData[activeIndex];
      }

      if (newWeather) {
        game.settings.set("railers", "currentWeather", newWeather);
        await roll.toMessage({
            flavor: game.i18n.localize("RAILERS.RollWeather"),
            content: `<div class="dice-results">${newWeather.name}</div>`,
            speaker: ChatMessage.getSpeaker({ alias: "Weather System" })
        });
        await this.updateHUD();
      }
  }

  static async rollTemperature() {
    const season = game.settings.get("railers", "currentSeason") || "winter";
    const tableName = season === "winter" ? "Winter Temperature" : "Summer Temperature";
    const rollTable = game.tables.find(t => t.name === tableName);
    if (!rollTable) return;

    const result = await rollTable.roll();
    const temperature = result.results[0]?.text || "N/A"; // Store the table result text
    const roll = result.roll; // Access the Roll object used by the table

    game.settings.set("railers", "currentTemperature", temperature);
    await roll.toMessage({
        flavor: game.i18n.localize("RAILERS.RollTemperature"),
        content: `<div class="dice-results">${temperature}</div>`,
        speaker: ChatMessage.getSpeaker({ alias: "Weather System" })
    });
    await this.updateHUD();
  }


  static _getHexStates(settingKey) {
      const storedStates = game.settings.get("railers", settingKey);
      if (!storedStates || storedStates.length !== 19) {
          const states = Array(19).fill("inactive");
          states[9] = "active"; // Center (2,2)
          game.settings.set("railers", settingKey, states);
          return states;
      }
      return storedStates;
  }
}

// Hooks
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
      default: { image: "systems/railers/assets/weather/clearhex.svg", name: game.i18n.localize("RAILERS.Clear") }
  });
  game.settings.register("railers", "currentTemperature", {
      scope: "world",
      config: false,
      type: String,
      default: "N/A"
  });
  game.settings.register("railers", "currentSeason", {
      scope: "world",
      config: false,
      type: String,
      default: "winter"
  });
});
