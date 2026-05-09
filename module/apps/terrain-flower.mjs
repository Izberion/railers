import { HEX_DATA, TERRAIN_TYPES, hexes } from "../helpers/hex-data.mjs";
import { getOrInitHexStates } from "../helpers/hex-helpers.mjs";

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
    }]
  };

  static PARTS = {
    content: {
      template: "systems/railers/templates/apps/terrain-flower.hbs"
    }
  };

  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  #dragDrop;

  get dragDrop() {
    return this.#dragDrop;
  }

  async _prepareContext(options = {}) {
    const hexStates = await getOrInitHexStates("terrainHexStates");
    const hexesWithState = HEX_DATA.map((hex, i) => ({ ...hex, state: hexStates[i] || "inactive" }));
    const columns = [
      { hexes: hexesWithState.slice(0, 3) },
      { hexes: hexesWithState.slice(3, 7) },
      { hexes: hexesWithState.slice(7, 12) },
      { hexes: hexesWithState.slice(12, 16) },
      { hexes: hexesWithState.slice(16, 19) }
    ];
    return { columns };
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
      html.querySelectorAll(".hex").forEach(hex => {
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
        await game.settings.set("railers", "terrainHexStates", hexStates);
      }

      const coordinates = activeHex.dataset.coordinates;
      const img = activeHex.querySelector("img");
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
        hexStates = currentStates;
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

    await game.settings.set("railers", "terrainHexStates", hexStates);
  }
}