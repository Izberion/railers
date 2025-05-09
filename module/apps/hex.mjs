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
        const hexStates = this._retrieveHexStates();
        const hexesWithState = hexData.map((hex, i) => ({ ...hex, state: hexStates[i] || "inactive" }));

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
        this._canvasBound = false;
      }

    #dragDrop;

    get dragDrop() {
        return this.#dragDrop;
    }

    async _onRender(context, options) {
        this.dragDrop.forEach(d => d.bind(this.element));
        await super._onRender(context, options);
        this.activateListeners(this.element);
    }

    activateListeners(html) {
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

        this.dragDrop.forEach(d => d.bind(html));
    }

    #createDragDropHandlers() {
        return this.options.dragDrop.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
            };
            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
            };
            return new DragDrop(d);
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
            scale: 1,
            x: 0,
            y: 0,
            z: 0,
            rotation: 0,
            hidden: false,
            locked: false
        };    
        event.dataTransfer.setData("text/plain", JSON.stringify(tileData));
    }

    async _handleHexClick(event, html) {
        const hexesElements = html.querySelectorAll(".hex");
        let hexStates = [];
        const terrainTypes = {
            "snowhex.svg": game.i18n.localize("RAILERS.apps.terrain.snowTerrain"),
            "hillhex.svg": game.i18n.localize("RAILERS.apps.terrain.hillTerrain"),
            "icehex.svg": game.i18n.localize("RAILERS.apps.terrain.iceTerrain"),
            "flathex.svg": game.i18n.localize("RAILERS.apps.terrain.flatTerrain"),
            "mountainhex.svg": game.i18n.localize("RAILERS.apps.terrain.mountainTerrain")
        };

        const target = event.currentTarget;
        if (target.classList.contains("d12hex")) {
            const currentStates = this._retrieveHexStates(); // Get current state

            const activeHex = Array.from(hexesElements).find((h, i) => currentStates[i] === "active");
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
            const terrainType = terrainTypes[fileName] || "Unknown";
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
                const newTerrainType = terrainTypes[newFileName] || "Unknown";

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
        await this.render(); // Force immediate render
    }

    _retrieveHexStates() {
        let hexStates = game.settings.get("railers", "terrainHexStates");
        if (!hexStates || hexStates.length !== 19) {
            hexStates = Array(19).fill("inactive");
            hexStates[9] = "active"; // Center (2,2)
            game.settings.set("railers", "terrainHexStates", hexStates);
        }
        return hexStates;
    }

    async _onClose(options) {
        if (this._canvasBound) {
          const canvasElement = game.canvas.app.renderer.canvas;
          canvasElement.removeEventListener("dragover", (event) => event.preventDefault());
          canvasElement.removeEventListener("drop", this._onCanvasDrop.bind(this));
          this._canvasBound = false;
        }
        await super._onClose(options);
    }
}

Hooks.once("init", () => {
    game.settings.register("railers", "terrainHexStates", {
        name: "Terrain Hex States",
        scope: "world",
        config: false,
        type: Array,
        default: []
    });
});



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
      const temp = game.settings.get("railers", "currentTemperature") || "N/A";
      const season = game.settings.get("railers", "currentSeason") || "winter";
  
      // Render the template with weather, temperature, and season
      const html = await renderTemplate("systems/railers/templates/apps/weather-hud.hbs", {
        weather: {
          image: weather.image,
          name: weather.name
        },
        temperature: temp,
        season: season.charAt(0).toUpperCase() + season.slice(1) // Capitalize
      });
  
      hud.innerHTML = html;
  
      // Add event listeners
      hud.querySelector(".weather").addEventListener("click", () => this.rollWeather());
      hud.querySelector(".temperature").addEventListener("click", () => this.rollTemperature());
      hud.querySelector(".season").addEventListener("click", () => this.toggleSeason());
    }
  
    static async rollWeather() {
      const weatherTypes = {
        "thundersnowhex.svg": game.i18n.localize("RAILERS.apps.weather.thunderSnow"),
        "snowstormhex.svg": game.i18n.localize("RAILERS.apps.weather.snowStorm"),
        "blizzardhex.svg": game.i18n.localize("RAILERS.apps.weather.blizzard"),
        "windhex.svg": game.i18n.localize("RAILERS.apps.weather.wind"),
        "flurryhex.svg": game.i18n.localize("RAILERS.apps.weather.flurry"),
        "overcasthex.svg": game.i18n.localize("RAILERS.apps.weather.overcast"),
        "polaroutbreakhex.svg": game.i18n.localize("RAILERS.apps.weather.polarOutbreak"),
        "aurorahex.svg": game.i18n.localize("RAILERS.apps.weather.aurora"),
        "clearhex.svg": game.i18n.localize("RAILERS.apps.weather.clear"),
        "icefoghex.svg": game.i18n.localize("RAILERS.apps.weather.iceFog"),
        "diamonddusthex.svg": game.i18n.localize("RAILERS.apps.weather.diamondDust"),
        "whiteouthex.svg": game.i18n.localize("RAILERS.apps.weather.whiteout")
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
      const temperature = result.results[0]?.text || "N/A";
      const roll = result.roll;
  
      game.settings.set("railers", "currentTemperature", temperature);
      await roll.toMessage({
        flavor: game.i18n.localize("RAILERS.apps.weather.rollTemperature"),
        content: `<div class="dice-results">${temperature}</div>`
      });
      await this.updateHUD();
    }
  
    static async toggleSeason() {
      const currentSeason = game.settings.get("railers", "currentSeason") || "winter";
      const newSeason = currentSeason === "winter" ? "summer" : "winter";
      await game.settings.set("railers", "currentSeason", newSeason);
      await this.updateHUD(); 
    }
  
    static _getHexStates(settingKey) {
      const storedStates = game.settings.get("railers", settingKey);
      if (!storedStates || storedStates.length !== 19) {
        const states = Array(19).fill("inactive");
        states[9] = "active"; 
        game.settings.set("railers", settingKey, states);
        return states;
      }
      return storedStates;
    }
}

Hooks.on("canvasReady", () => {
    WeatherHUD.showHUD(); 
  });

let diceFlowerApp = null;

Hooks.on("getSceneControlButtons", (controls) => {
    const railersGroup = {
        name: "railersControls",
        title: game.i18n.localize("RAILERS.apps.base.railersControls"),
        icon: "fas fa-train",
        layer: "controls",
        tools: [
            {
            name: "terrain",
            title: game.i18n.localize("RAILERS.apps.terrain.openTerrainFlower"),
            icon: "fas fa-mountain",
            toggle: true,
            active: false,
            onClick: (toggle) => {
                if (!diceFlowerApp) {
                    diceFlowerApp = new DiceFlowerApp
                }
                if (toggle) diceFlowerApp.render(true);
                else diceFlowerApp.close();
            }
        },
            {
                name: "weather",
                title: game.i18n.localize("RAILERS.apps.weather.toggleWeatherHUD"),
                icon: "fas fa-cloud-sun",
                toggle: true,
                active: !!document.getElementById("railers-weather-hud"),
                onClick: (toggle) => {
                    if (toggle) WeatherHUD.showHUD();
                    else WeatherHUD.hideHUD();
                }
            }
        ]
    };
    controls.push(railersGroup);
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