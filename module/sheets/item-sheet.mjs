import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";
import { onRollDisease } from "../helpers/disease-roll.mjs";
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class RailersItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["railers", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/railers/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    context.effects = prepareActiveEffectCategories(this.item.effects);

    context.diseaseRolled = this.item.getFlag('railers', 'diseaseRolled');

    context.stowageOptions = CONFIG.RAILERS.stowageOptions;
    context.actionOptions = CONFIG.RAILERS.actionOptions;
    context.actionTypeOptions = CONFIG.RAILERS.actionTypeOptions;
    context.rangeOptions = CONFIG.RAILERS.rangeOptions;
    context.clothingTypeOptions = CONFIG.RAILERS.clothingTypeOptions;

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;
    
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.item));

    html.find('.generate-disease').click(async (event) => {
      await onRollDisease(event, html, this.item, this);
    });
    

  }
}
