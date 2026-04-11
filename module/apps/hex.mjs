const TERRAIN_TYPES = {
  "snowhex.svg": "RAILERS.apps.terrain.snowTerrain",
  "hillhex.svg": "RAILERS.apps.terrain.hillTerrain",
  "icehex.svg": "RAILERS.apps.terrain.iceTerrain",
  "flathex.svg": "RAILERS.apps.terrain.flatTerrain",
  "mountainhex.svg": "RAILERS.apps.terrain.mountainTerrain"
};

const WEATHER_TYPES = {
  "thundersnowhex.svg": "RAILERS.apps.weather.thunderSnow",
  "snowstormhex.svg": "RAILERS.apps.weather.snowStorm",
  "blizzardhex.svg": "RAILERS.apps.weather.blizzard",
  "windhex.svg": "RAILERS.apps.weather.wind",
  "flurryhex.svg": "RAILERS.apps.weather.flurry",
  "overcasthex.svg": "RAILERS.apps.weather.overcast",
  "polaroutbreakhex.svg": "RAILERS.apps.weather.polarOutbreak",
  "aurorahex.svg": "RAILERS.apps.weather.aurora",
  "clearhex.svg": "RAILERS.apps.weather.clear",
  "icefoghex.svg": "RAILERS.apps.weather.iceFog",
  "diamonddusthex.svg": "RAILERS.apps.weather.diamondDust",
  "whiteouthex.svg": "RAILERS.apps.weather.whiteout"
};

export const HEX_DATA = [
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

export const WEATHER_DATA = [
  { coords: "(0,0)", image: "systems/railers/assets/weather/thundersnowhex.svg" },
  { coords: "(0,1)", image: "systems/railers/assets/weather/snowstormhex.svg"},
  { coords: "(0,2)", image: "systems/railers/assets/weather/blizzardhex.svg" },
  { coords: "(1,0)", image: "systems/railers/assets/weather/windhex.svg" },
  { coords: "(1,1)", image: "systems/railers/assets/weather/flurryhex.svg" },
  { coords: "(1,2)", image: "systems/railers/assets/weather/overcasthex.svg" },
  { coords: "(1,3)", image: "systems/railers/assets/weather/polaroutbreakhex.svg" },
  { coords: "(2,0)", image: "systems/railers/assets/weather/aurorahex.svg" },
  { coords: "(2,1)", image: "systems/railers/assets/weather/clearhex.svg" },
  { coords: "(2,2)", image: "systems/railers/assets/weather/clearhex.svg" },
  { coords: "(2,3)", image: "systems/railers/assets/weather/clearhex.svg" },
  { coords: "(2,4)", image: "systems/railers/assets/weather/icefoghex.svg" },
  { coords: "(3,0)", image: "systems/railers/assets/weather/blizzardhex.svg" },
  { coords: "(3,1)", image: "systems/railers/assets/weather/overcasthex.svg" },
  { coords: "(3,2)", image: "systems/railers/assets/weather/flurryhex.svg" },
  { coords: "(3,3)", image: "systems/railers/assets/weather/windhex.svg" },
  { coords: "(4,0)", image: "systems/railers/assets/weather/diamonddusthex.svg" },
  { coords: "(4,1)", image: "systems/railers/assets/weather/snowstormhex.svg" },
  { coords: "(4,2)", image: "systems/railers/assets/weather/whiteouthex.svg" }
];

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

function getOrInitHexStates(settingKey) {
  const stored = game.settings.get("railers", settingKey);
  if (!stored || stored.length !== 19) {
    const states = Array(19).fill("inactive");
    states[9] = "active";
    return states;
  }
  return stored;
}


export class DiceFlowerApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static DEFAULT_OPTIONS = {
            id: "terrain-flower-app",
            tag: "div",
            window: {
                title: "RAILERS.apps.terrain.terrainFlower",
                resizable: true,
                contentClasses: ["standard-form", "railers"]
            },
            position: {
                width: 625,
                height: 550
            },
            dragDrop: [{
                dragSelector: ".draggable-hex",
                dropSelector: null 
            }],
        }

    static PARTS = {
        content: {
            template: "systems/railers/templates/apps/terrain-flower.hbs"
        }
    };

    async _prepareContext(options = {}) {
        
        const hexStates = await getOrInitHexStates("terrainHexStates");
        const hexesWithState = HEX_DATA.map((hex, i) => ({ ...hex, state: hexStates[i] || "inactive" }));
        const columns = [
            { hexes: hexesWithState.slice(0, 3) },  // (0,0) to (0,2)
            { hexes: hexesWithState.slice(3, 7) },  // (1,0) to (1,3)
            { hexes: hexesWithState.slice(7, 12) }, // (2,0) to (2,4)
            { hexes: hexesWithState.slice(12, 16) }, // (3,0) to (3,3)
            { hexes: hexesWithState.slice(16, 19) }  // (4,0) to (4,2)
        ];

        return { columns };
    }

    constructor(options = {}) {
        super(options);
        this.#dragDrop = this.#createDragDropHandlers();
      }

    #dragDrop;

    get dragDrop() {
        return this.#dragDrop;
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        this.dragDrop.forEach(d => d.bind(this.element));
        this._bindHexListeners(this.element);
    }

    _bindHexListeners(html) {
        if (game.user.isGM) {
            const d12hex = html.querySelector(".d12hex");
            if (d12hex) {
              d12hex.addEventListener("click", (event) => this._handleHexClick(event, html));
            }
            const hexes = html.querySelectorAll(".hex");
            hexes.forEach(hex => {
              hex.addEventListener("click", (event) => this._handleHexClick(event, html));
            });
        }
    }

    #createDragDropHandlers() {
      return this.options.dragDrop.map((d) => {
        d.permissions = {
          dragstart: this._canDragStart.bind(this),
          drop: () => true        
        };

        d.callbacks = {
          dragstart: this._onDragStart.bind(this)
        };

        return new foundry.applications.ux.DragDrop.implementation(d);
      });
    }

    _canDragStart(selector) {
        return game.user.isGM;
    }

    _onDragStart(event) {
      const el = event.currentTarget;
      if (!el.classList.contains("draggable-hex")) return;

      const tileData = {
        type: "Tile",
        texture: { src: el.src },
        width: 120,
        height: 105,
        rotation: 0,
        hidden: false,
        locked: false
      };

      const json = JSON.stringify(tileData);

      event.dataTransfer.setData("application/vnd.foundry.document+json", json);

      event.dataTransfer.setData("text/plain", json);

      event.dataTransfer.effectAllowed = "copy";
    }

    async _handleHexClick(event, html) {
        const hexesElements = html.querySelectorAll(".hex");
        let hexStates = [];

        const target = event.currentTarget;
        if (target.classList.contains("d12hex")) {
            const currentStates = await getOrInitHexStates("terrainHexStates");

            let activeHex = Array.from(hexesElements).find((h, i) => currentStates[i] === "active");
            if (!activeHex) {
                activeHex = html.querySelector('.hex[data-coordinates="(2,2)"]');
                hexesElements.forEach(h => {
                    h.classList.remove("active");
                    h.classList.add("inactive");
                });
                hexStates = Array.from(hexesElements).map(() => "inactive");
                activeHex.classList.remove("inactive");
                activeHex.classList.add("active");
                const activeIndex = Array.from(hexesElements).indexOf(activeHex);
                hexStates[activeIndex] = "active";
                await game.settings.set("railers", "terrainHexStates", hexStates); // Save immediately
            }

            const coordinates = activeHex.dataset.coordinates;
            const img = activeHex.querySelector("img"); // Use activeHex directly
            const fileName = img.src.split("/").pop();
            const terrainType = game.i18n.localize(TERRAIN_TYPES[fileName] ?? "RAILERS.apps.terrain.unknown");
            const roll = await new Roll("1d12").evaluate();

            if (roll.total % 2 === 0) {
                const index = Math.floor(roll.total / 2) - 1;
                const adjacentHexes = hexes[coordinates];
                if (!adjacentHexes || index < 0 || index >= adjacentHexes.length) {
                    console.warn("Invalid adjacent hex index:", index);
                    return;
                }

                const newCoordinates = adjacentHexes[index];
                const newHex = html.querySelector(`.hex[data-coordinates="${newCoordinates}"]`);
                if (!newHex) {
                    console.warn("New hex not found:", newCoordinates);
                    return;
                }
                const newImg = newHex.querySelector("img");
                const newFileName = newImg.src.split("/").pop();
                const newTerrainType = game.i18n.localize(TERRAIN_TYPES[newFileName] ?? "RAILERS.apps.terrain.unknown");

                await roll.toMessage({
                    flavor: game.i18n.localize("RAILERS.apps.terrain.rollTerrainFlower"),
                    content: `<div class="dice-results">${newTerrainType}</div>`
                });

                // Update DOM and states
                hexesElements.forEach(h => {
                    h.classList.remove("active");
                    h.classList.add("inactive");
                });
                hexStates = Array.from(hexesElements).map(() => "inactive");
                newHex.classList.remove("inactive");
                newHex.classList.add("active");
                const newIndex = Array.from(hexesElements).indexOf(newHex);
                hexStates[newIndex] = "active";
            } else {
                await roll.toMessage({
                    flavor: game.i18n.localize("RAILERS.apps.terrain.rollTerrainFlower"),
                    content: `<div class="dice-results">${terrainType}</div>`
                });
                hexStates = currentStates; // Preserve current state on odd roll
                return;
            }
        } else {
            hexesElements.forEach(h => {
                h.classList.remove("active");
                h.classList.add("inactive");
                hexStates.push("inactive");
            });
            target.classList.remove("inactive");
            target.classList.add("active");
            hexStates[Array.from(hexesElements).indexOf(target)] = "active";
        }

        await game.settings.set("railers", "terrainHexStates", hexStates); // Ensure saved
    }
}

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
      let temp = game.settings.get("railers", "currentTemperature") || "N/A";
      const season = game.settings.get("railers", "currentSeason") || "winter";

      // Apply Polar Outbreak modifier dynamically
      if (weather?.name === "Polar Outbreak" && temp !== "N/A") {
        const tempMatch = temp.match(/-?\d+/); // extract numeric part
        if (tempMatch) {
          const tempValue = parseInt(tempMatch[0], 10) - 20;
          temp = temp.replace(/-?\d+/, tempValue);
        }
      }

      // Render the template with weather, temperature, and season
      const html = await foundry.applications.handlebars.renderTemplate(
        "systems/railers/templates/apps/weather-hud.hbs",
        {
          weather: {
            image: weather?.image,
            name: weather?.name
          },
          temperature: temp,
          season: season.charAt(0).toUpperCase() + season.slice(1) // Capitalize
        }
      );

      hud.innerHTML = html;

      // Add event listeners
      hud.querySelector(".weather").addEventListener("click", () => this.rollWeather());
      hud.querySelector(".temperature").addEventListener("click", () => this.rollTemperature());
      hud.querySelector(".season").addEventListener("click", () => this.toggleSeason());
    }

  
    static async rollWeather() {
      const states = await getOrInitHexStates("weatherHexStates");
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
          name: game.i18n.localize(WEATHER_TYPES[fileName])
        };
        game.settings.set("railers", "currentWeather", newWeather);
        await roll.toMessage({
          flavor: game.i18n.localize("RAILERS.apps.weather.rollWeather"),
          content: `<div class="dice-results">${newWeather.name}</div>`
        });
        await this.updateHUD();
      }
    }
  
    static async rollTemperature() {
      const season = game.settings.get("railers", "currentSeason") || "winter";
      const tableName = season === "winter" ? "Winter Temperature" : "Summer Temperature";
      const compendium = game.packs.get("railers.tables");
      const tableEntry = compendium.index.find(t => t.name === tableName);
      const rollTable = await compendium.getDocument(tableEntry._id);
      if (!rollTable) return;

      const result = await rollTable.roll();
      const temperature = result.results[0]?.description || "N/A";
      const roll = result.roll;

      // Save the original rolled temperature to settings
      game.settings.set("railers", "currentTemperature", temperature);

      // Calculate adjusted for chat only
      let adjustedTemperature = temperature;
      const weather = game.settings.get("railers", "currentWeather");
      if (weather?.name === "Polar Outbreak" && temperature !== "N/A") {
        const tempMatch = temperature.match(/-?\d+/);
        if (tempMatch) {
          const tempValue = parseInt(tempMatch[0], 10) - 20;
          adjustedTemperature = temperature.replace(/-?\d+/, tempValue);
        }
      }

      // Output to chat showing original roll and adjusted temperature if different
      const content = adjustedTemperature !== temperature
        ? `<div class="dice-results">${game.i18n.format("RAILERS.apps.weather.adjustedTemperature", { adjustedTemperature })}</div>`
        : `<div class="dice-results">${temperature}</div>`;

      await roll.toMessage({
        flavor: game.i18n.localize("RAILERS.apps.weather.rollTemperature"),
        content: content
      });

      // Update the HUD (which applies the adjustment)
      await this.updateHUD();
    }
  
    static async toggleSeason() {
      const currentSeason = game.settings.get("railers", "currentSeason") || "winter";
      const newSeason = currentSeason === "winter" ? "summer" : "winter";
      await game.settings.set("railers", "currentSeason", newSeason);
      await this.updateHUD(); 
    }
  
}

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
        default: { image: "systems/railers/assets/weather/clearhex.svg", name: game.i18n.localize("RAILERS.apps.weather.clear") }
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