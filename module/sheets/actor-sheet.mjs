import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class RailersActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["railers", "sheet", "actor"],
      template: "systems/railers/templates/actor/actor-sheet.html",
      width: 750,
      height: 600,
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

    for (let item of context.items) {

      let stowageKey = item.system.stowage;
      let reloadKey = item.system.reload;
      let attackKey = item.system.attack;
      let rangeKey = item.system.range;
      let typeKey = item.system.type;

      item.system.stowage = game.i18n.localize(CONFIG.RAILERS.stowageOptions[stowageKey]);
      item.system.reload = game.i18n.localize(CONFIG.RAILERS.actionOptions[reloadKey]);
      item.system.attack= game.i18n.localize(CONFIG.RAILERS.actionOptions[attackKey]);
      item.system.range = game.i18n.localize(CONFIG.RAILERS.rangeOptions[rangeKey]);
      item.system.type = game.i18n.localize(CONFIG.RAILERS.actionTypeOptions[typeKey]);
      
    }


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
      console.log(item); // Add this line to check the item
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
    html.on("click", ".roll", {actor: this.actor}, this.rollDialog);

    // Add a click listener for the "Add Wound" button
    html.find('.wound-create').click(this._onWoundCreate.bind(this));

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
   

    let hexes = {
      "(0,0)": ["(1,0)", "(1,1)", "(0,1)", "(2,0)", "(4,2)", "(0,3)"],
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



    html.on('click', '.hex, .d12hex', async (event) => {
      const hexesElements = html.find('.hex');
      let hexStates = [];
      let coordinates, roll, index;
    
      // Mapping of image file names to terrain types
      const terrainTypes = {
        'snowhex.svg': game.i18n.localize("RAILERS.SnowTerrain"),
        'hillhex.svg': game.i18n.localize("RAILERS.HillTerrain"),
        'icehex.svg': game.i18n.localize("RAILERS.IceTerrain"),
        'flathex.svg': game.i18n.localize("RAILERS.FlatTerrain"),
        'mountainhex.svg': game.i18n.localize("RAILERS.MountainTerrain")
      };
    
      if ($(event.currentTarget).hasClass('d12hex')) {
        // Roll a d12
        roll = await new Roll('1d12').roll();

        // Get the default roll result HTML
        const rollResultHTML = await roll.render();
    
        // Log the result to the console for debugging
        console.log(`Rolled a ${roll.total}`);
    
        // Get the coordinates of the active hex
        coordinates = hexesElements.filter('.active').data('coordinates');
    
        // Get the image src of the active hex
        const imgSrc = html.find(`.hex[data-coordinates="${coordinates}"]`).find('img').attr('src');
    
        // Extract the file name from the src
        const fileName = imgSrc.split('/').pop();
    
        // Get the terrain type based on the file name
        const terrainType = terrainTypes[fileName];
    
        // If the roll is even, calculate the new active hex and its terrain
        if (roll.total % 2 === 0) {
          // Calculate the index of the new active hex based on the roll
          index = Math.floor(roll.total / 2) - 1;
    
          // Get the adjacent hexes
          let adjacentHexes = hexes[coordinates];
    
          // Make sure the index is within the bounds of the array
          if (index < 0 || index >= adjacentHexes.length) return;
    
          // Get the coordinates of the new active hex
          let newCoordinates = adjacentHexes[index];
    
          // Find the new active hex
          let newActiveHex = html.find(`.hex[data-coordinates="${newCoordinates}"]`);
    
          // Get the image src of the new active hex
          const newImgSrc = newActiveHex.find('img').attr('src');
    
          // Extract the file name from the src
          const newFileName = newImgSrc.split('/').pop();
    
          // Get the terrain type based on the file name
          const newTerrainType = terrainTypes[newFileName];
    
          // Output the roll and the new terrain type to the chat
          roll.toMessage({
            flavor: game.i18n.localize("RAILERS.RollTerrainFlower"),
            content: `${rollResultHTML}<div class="dice-results">${newTerrainType}</div>`,
            speaker: ChatMessage.getSpeaker({ actor: this.actor })
          });
    
          // Make all hexes inactive
          hexesElements.removeClass('active').addClass('inactive');
          hexStates = hexesElements.map(() => 'inactive').toArray()
    
          // Make the new hex active
          newActiveHex.removeClass('inactive').addClass('active');
    
          // Record the state of the new active hex
          hexStates[hexesElements.index(newActiveHex)] = 'active'; 
        } else {
          // If the roll is odd, output the roll and the current terrain type to the chat
          roll.toMessage({
            flavor: game.i18n.localize("RAILERS.RollTerrainFlower"),
            content: `${rollResultHTML}<div class="dice-results">${terrainType}</div>`,
            speaker: ChatMessage.getSpeaker({ actor: this.actor })
          })
          return;
        }
      } else {
        // Handle manual hex selection
        hexesElements.each((i, h) => {
          h.classList.remove('active');
          h.classList.add('inactive');
          hexStates.push('inactive'); // Record the state of each hex
        });
        event.currentTarget.classList.remove('inactive');
        event.currentTarget.classList.add('active');
        hexStates[hexesElements.index(event.currentTarget)] = 'active'; // Record the state of the clicked hex
      }
    
      // Store the hex states in the actor's flags
      this.actor.setFlag('railers', 'hexStates', hexStates);
    });
    
    // After the listeners are activated, retrieve the hex states from the actor's flags
    let hexStates = this.actor.getFlag('railers', 'hexStates');
    
    // If the hex states exist, apply them to the corresponding hex
    if (hexStates) {
      const hexes = html.find('.hex');
      hexes.each((i, h) => {
        h.classList.remove('active', 'inactive');
        h.classList.add(hexStates[i]);
      });
    }
    



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

  }

  

/*****************************************************************/

  async rollDialog(event) {
    const attpool = Number(event.currentTarget.dataset.attpool);
    const skillpool = Number(event.currentTarget.dataset.skillpool);
    const npcpool = Number(event.currentTarget.dataset.npcpool);
    const thisActor = event.data.actor;
    const characterName = thisActor.name;
    const rollName = event.currentTarget.dataset.label;
    const content = await renderTemplate("systems/railers/templates/dialog/roll-dialog.html");
    const dialogReturn = await Dialog.wait({
      title: game.i18n.localize("RAILERS.ModifyDiceRoll"),
      content,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("RAILERS.Roll"),
          callback: async (html) => {
            const mod = parseInt(html.find('input[name="modifier"]').val()) || 0;
            const tn = parseInt(html.find('select[name="tn"]').val()) || 5;

            let rollFormula;
            let poolTotal;

            if (!isNaN(skillpool)) {
              poolTotal = skillpool;
              poolTotal += attpool;
            } else if (!isNaN(npcpool)) {
              poolTotal = npcpool;
            } else {
                poolTotal = attpool;
            }
              poolTotal += mod;

            if (poolTotal === 0) {
              rollFormula = `2d8kl1x8cs>=${tn}df=1`;
            } else if (poolTotal < 0) {
              rollFormula = "0";
            } else {
              rollFormula = `${poolTotal}d8x8cs>=${tn}df=1`;
            }

            const r = new Roll(rollFormula);
            await r.roll();
            const rollResultHTML = await r.render();
            const rollTotal = r.total;

            let successType;

            if (rollFormula === "0") {
              successType = game.i18n.localize("RAILERS.AutomaticFailure");
            }
            else if (!isNaN(skillpool)) {
              if (rollTotal < 0) {
                successType = game.i18n.localize("RAILERS.ComplicatedFailure");
              } else if (rollTotal === 0) {
                successType = game.i18n.localize("RAILERS.Failure");
              } else if (rollTotal >= 1 && rollTotal <= 2) {
                successType = game.i18n.localize("RAILERS.ComplicatedSuccess");
              } else if (rollTotal >= 3 && rollTotal <= 4) {
                successType = game.i18n.localize("RAILERS.Success");
              } else {
                successType = game.i18n.localize("RAILERS.GreatSuccess");
              }
            }
            else {  
              if (rollTotal <= 0) {
                successType = game.i18n.localize("RAILERS.Failure");
              } else {
                successType = game.i18n.localize("RAILERS.Success");
              }
            }
          
            await r.toMessage({
              user: game.user.id,
              speaker: {
                actor: thisActor,
                alias: characterName,
              },
              flavor: !isNaN(npcpool) ? game.i18n.format("RAILERS.RollRoll", { tn: tn }) : game.i18n.format(!isNaN(skillpool) ? "RAILERS.RollCheck" : "RAILERS.RollSave", { rollName: rollName, tn: tn }),
              content: `${rollResultHTML}<div class="dice-results">${successType}</div>`,
            });
            return {};
          },
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("RAILERS.Cancel"),
          callback: (html) => {
            return {};
          }
        }
      },
      default: "one",
    });
  }



 /****************************************************************/

  async addWoundDialog(actor) {
    const content = await renderTemplate("systems/railers/templates/dialog/wound-dialog.html");
    const dialogReturn = await Dialog.wait({
      title: game.i18n.localize("RAILERS.AddWound"),
      content,
      buttons: {
        ok: {
          label: game.i18n.localize("RAILERS.Add"),
          callback: async (html) => {
            const damage = parseInt(html.find('input[name="wound-damage"]').val(), 10) || 0;
            const severity = parseInt(html.find('input[name="wound-severity"]').val(), 10) || 0;
            const name = html.find('input[name="wound-name"]').val() || "Wound";

            // Create a new "Wound" item with the provided values
            const woundData = {
              name,
              type: "wound",
              data: {
                damage,
                severity
              },
            };

            // Use createEmbeddedDocuments to add the new wound to the actor's items
            const wounds = await actor.createEmbeddedDocuments("Item", [woundData]);

          }
        },
        cancel: {
          label: game.i18n.localize("RAILERS.Cancel"),
        },
      },
      default: "ok",
    });
  }


 /****************************************************************/
  // Handle the "Add Wound" button click
  _onWoundCreate(event) {
    event.preventDefault();
    // Call the function to show the "Add Wound" dialog
    this.addWoundDialog(this.actor);
  }

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
    const data = duplicate(header.dataset);
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
        img: img,
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
    // Parse the data from the event
    let data = JSON.parse(event.dataTransfer.getData('text/plain'));
  
    if (data.img) {
      // Prevent the default behavior for image drops
      event.preventDefault();
  
      // Acquire the cursor position transformed to Canvas coordinates
      const [x, y] = [event.clientX, event.clientY];
      const t = canvas.app.stage.worldTransform;
      data.x = (x - t.tx) / canvas.app.stage.scale.x;
      data.y = (y - t.ty) / canvas.app.stage.scale.y;
    
      // Create the Tile
      await canvas.scene.createEmbeddedDocuments("Tile", [data]);
    
      console.log(data);
    } else {
      super._onDrop(event);
    }
  }






}
