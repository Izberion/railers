import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import { handleHexClick, retrieveHexStates } from "../helpers/hex.mjs";
import { rollDialog } from "../dialogs/roll-dialog.mjs";
import { addWoundDialog } from "../dialogs/wound-dialog.mjs";
import { attackDialog } from "../dialogs/attack-dialog.mjs";
import { onRollHp } from "../helpers/demon-hp.mjs";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class RailersActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["railers", "sheet", "actor"],
      template: "systems/railers/templates/actor/actor-sheet.html",
      width: 750,
      height: 680,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "biography" }]
    });
  }

  /** @override */
  get template() {
    return `systems/railers/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    context.locomotiveOptions = CONFIG.RAILERS.locomotiveOptions;
    context.seasons = CONFIG.RAILERS.seasons;

    for (let item of context.items) {

      let stowageKey = item.system.stowage;
      let reloadKey = item.system.reload;
      let attackKey = item.system.attack;
      let rangeKey = item.system.range;
      let typeKey = item.system.type;
      let actionKey = item.system.action;
      let clothingTypeKey = item.system.clothingType;

      item.system.stowage = game.i18n.localize(CONFIG.RAILERS.stowageOptions[stowageKey]);
      item.system.reload = game.i18n.localize(CONFIG.RAILERS.actionOptions[reloadKey]);
      item.system.attack= game.i18n.localize(CONFIG.RAILERS.actionOptions[attackKey]);
      item.system.range = game.i18n.localize(CONFIG.RAILERS.rangeOptions[rangeKey]);
      item.system.type = game.i18n.localize(CONFIG.RAILERS.actionTypeOptions[typeKey]);
      item.system.action = game.i18n.localize(CONFIG.RAILERS.actionTypeOptions[actionKey]);
      item.system.clothingType = game.i18n.localize(CONFIG.RAILERS.clothingTypeOptions[clothingTypeKey]);
    }

    context.items.sort((a, b) => (a.system.severity || 0) - (b.system.severity || 0) || (a.system.damage || 0) - (b.system.damage || 0));





    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.RAILERS.attributes[k]) ?? k;
    }


  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;


  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    // Roll Dialog
    html.on("click", ".roll", {actor: this.actor}, rollDialog);
    html.on("click", ".attack-roll", {actor: this.actor}, attackDialog);


    // Add a click listener for the "Add Wound" button
    html.find('.wound-create').click(addWoundDialog.bind(this, this.actor, html));

    // Add a click listener for the "Edit Wound" button
    html.find('.wound-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("woundId"));
      item.sheet.render(true);
    });

    html.find('.wound-heal').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("woundId"));
      let damage = Math.max(0, item.system.damage - 1);
      
      if (damage === 0) {
        item.delete();
        li.slideUp(200, () => this.render(false));
      } else {
        item.update({ 'system.damage': damage });
      }
    });

    // Add a click listener for the "Clear Wound" button
    html.find('.wound-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("woundId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });


    html.find('.weapon-reload').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.update({ 'system.magazine.value': item.system.magazine.max})
    });


    html.find('select[name="system.locomotive"]').change(this._onLocomotiveChange.bind(this));
   

    html.find('.rollSeason').click(async function() {
      let season = html.find('input[name="system.season"]:checked').val();

      let tableName;
      if (season === 'winter') {
        tableName = 'Winter Temperature';
      } else if (season === 'summer') {
        tableName = 'Summer Temperature';
      }

      // Fetch the RollTable entity
      let rollTable = game.tables.contents.find(t => t.name === tableName);
      
      // Draw from the RollTable
      await rollTable.draw({roll: true});
      // tableResultText = tableResult.results[0].text;
      
    });
    

    html.on('click', '.hex, .d12hex', async (event) => {
      await handleHexClick(event, html, this.actor);
    });

    retrieveHexStates(this.actor, html);


    let hexImages = html.find('.draggable-hex');

    // Add draggable attribute and event listener to each image
    hexImages.each((i, img) => {
      img.setAttribute('draggable', 'true');
      img.addEventListener('dragstart', this._onDragStart.bind(this));
    });
    
    // Remove any existing drop event listeners on the canvas
    canvas.app.view.removeEventListener('drop', this._onDrop);
    
    // Listen for drop events on the canvas
    canvas.app.view.addEventListener('drop', this._onDrop);


    // Listen for click events on the roll hp button
    html.find('.roll-hp').click((event) => onRollHp(event, this.actor));

  }

  

/*****************************************************************/

  // Handle the "Edit Wound" button click
  _onWoundEdit(event) {
    event.preventDefault();
    // Get the ID of the wound to edit
    let woundId = $(event.currentTarget).parents('.item').data('wound-id');
    // Get the wound data and show the edit dialog
    let wound = this.actor.items.get(woundId);
    if (wound) {
      wound.sheet.render(true);
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[attribute] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }


  _onLocomotiveChange(event) {
    event.preventDefault();
  
    const selectedType = event.target.value;
  
    const types = {
      ace: { armor: 4, power: 24, speed: 7, fuel: 100, weight: 1050},
      bigBrother: { armor: 5, power: 15, speed: 3, fuel: 60, weight: 950},
      comet: { armor: 2, power: 12, speed: 9, fuel: 42, weight: 650},
      compact: { armor: 3, power: 0, speed: 3, fuel: 48, weight: 0},
      donkey: { armor: 3, power: 10, speed: 8, fuel: 80, weight: 1500},
      dynamo: { armor: 4, power: 25, speed: 5, fuel: 56, weight: 750},
      flex: { armor: 2, power: 8, speed: 3, fuel: 36, weight: 500},
      joes: { armor: 3, power: 15, speed: 5, fuel: 70, weight: 800},
      littleMan: { armor: 1, power: 9, speed: 3, fuel: 60, weight: 550},
      marathoner: { armor: 1, power: 16, speed: 4, fuel: 128, weight: 700}
    };
  
    const stats = types[selectedType];
  
    new Dialog({
      title: game.i18n.localize("RAILERS.Warning"),
      content: game.i18n.localize("RAILERS.ChangeLocomotiveWarning"),
      buttons: {
        continue: {
          label: game.i18n.localize("RAILERS.Continue"),
          callback: () => {
            // Update the actor's data
            this.actor.update({
              'system.speed': stats.speed,
              'system.fuel.max': stats.fuel,
              'system.armor': stats.armor,
              'system.power.max': stats.power,
              'system.weight.max': stats.weight
            });
          },
        },
        cancel: {
          label: game.i18n.localize("RAILERS.Cancel"),
        },
      },
      default: 'cancel',
    }).render(true);
  }
  

  _onDragStart(event) {
    // Store the source image URL and dimensions in the dataTransfer object
    if (event.target.classList.contains('draggable-hex')) {
      let img = event.target.src;
      let width = 120;
      let height = 105;

      // Create a temporary Tile data object
      let tileData = {
        texture: { src: img },
        width: width,
        height: height,
        x: 0,
        y: 0,
        z: 0,
        rotation: 0,
        hidden: false,
        locked: false
      };

      // Set the data for the drag event
      event.dataTransfer.setData('text/plain', JSON.stringify(tileData));
    } else {
      super._onDragStart(event);
    }
  }

  async _onDrop(event) {
    event.preventDefault();

    const data = JSON.parse(event.dataTransfer.getData('text/plain'));

    if (data.texture && data.texture.src) {
      const [x, y] = [event.clientX, event.clientY];
      const t = canvas.stage.worldTransform;
      data.x = (x - t.tx) / canvas.stage.scale.x;
      data.y = (y - t.ty) / canvas.stage.scale.y;

      // Create the tile on the canvas
      await canvas.scene.createEmbeddedDocuments("Tile", [data]);

      console.log("Tile data dropped:", data);

    }
  }

}
