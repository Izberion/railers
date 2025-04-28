// Import document classes.
import { RailersActor } from "./documents/actor.mjs";
import { RailersItem } from "./documents/item.mjs";
// Import sheet classes.
import { RailersActorSheet } from "./sheets/actor-sheet.mjs";
import { RailersItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { RAILERS } from "./helpers/config.mjs";
import { DiceFlowerApp, WeatherHUD } from "./apps/hex.mjs";
import * as models from "./data/_module.mjs"


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */


globalThis.railers = {
  documents: {
    RailersActor,
    RailersItem
  },
  applications: {
    RailersActorSheet,
    RailersItemSheet
  },
  utils: {
    rollItemMacro
  },
  models
};

Hooks.once('init', async function() {

  CONFIG.RAILERS = RAILERS;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  
  CONFIG.Combat.initiative = {
    formula: "(@initiativePool)d8x8cs>=6df=1 + (@initiativePool) / 100",
    decimals: 2
  };

  
  CONFIG.Actor.documentClass = RailersActor;

  CONFIG.Actor.dataModels = {
    character: models.RailersCharacter,
    npc: models.RailersNPC,
    demon: models.RailersDemon,
    train: models.RailersTrain
  };


  CONFIG.Item.documentClass = RailersItem;

  CONFIG.Item.dataModels = {
    gear: models.RailersGear,
    wound: models.RailersWound,
    weapon: models.RailersWeapon,
    clothing: models.RailersClothing,
    condition: models.RailersCondition,
    mutation: models.RailersMutation,
    car: models.RailersCar,
    cargo: models.RailersCargo,
    ability: models.RailersAbility
  };

  
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("railers", RailersActorSheet, { 
    makeDefault: true,
    label: "RAILERS.SheetLabels.Actor",
    types: ["character", "npc", "demon", "train"]
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("railers", RailersItemSheet, {
    makeDefault: true,
    label: "RAILERS.SheetLabels.Item",
    types: ["gear", "wound", "weapon", "clothing", "condition", "mutation", "car", "cargo", "ability"]
  });


  CONFIG.RAILERS.DiceFlowerApp = DiceFlowerApp;
  CONFIG.RAILERS.WeatherHUD = WeatherHUD;

});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('ifOr', function (...args) {
  const options = args.pop();
  const isTrue = args.some(arg => !!arg);
  return isTrue ? options.fn(this) : options.inverse(this);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createDocMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.railers.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "railers.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}
