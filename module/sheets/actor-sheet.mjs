import { prepareActiveEffectCategories } from "../helpers/effects.mjs";
import { rollDialog } from "../dialogs/roll-dialog.mjs";
import { attackDialog } from "../dialogs/attack-dialog.mjs";
import { addWoundDialog } from "../dialogs/wound-dialog.mjs";
import { onRollHp } from "../apps/hp-roller.mjs";
import { defenseDialog } from "../dialogs/defense-dialog.mjs";
import { ActorTweaks } from "../apps/actor-tweaks.mjs";
import { locomotiveChange } from "../dialogs/locomotive-change.mjs";
import { reloadDialog } from "../dialogs/reload-dialog.mjs";
import { rollMutationsDialog } from "../dialogs/mutation-dialog.mjs";
import { AttributeRoller } from "../apps/attribute-roller.mjs";
import { locomotiveAdd } from "../dialogs/locomotive-add.mjs" ;
import { adjustThermsDialog } from "../dialogs/adjust-therms-dialog.mjs";


const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class RailersActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {

  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this._onLocomotiveChange = this._handleLocomotiveChange.bind(this);
    this._locomotivePending = null;
   }

   /** @override */
  static DEFAULT_OPTIONS = {
    classes: ['railers', 'actor'],
    position: {
      width: 700,
      height: 860,
    },
    actions: {
      viewDoc: this._viewDoc,
      createDoc: this._createDoc,
      deleteDoc: this._deleteDoc,
      toggleEffect: this._toggleEffect,
      addWound: this._addWound,
      woundHeal: this._onWoundHeal,
      roll: this._onRoll,
      weaponReload: this._onWeaponReload,
      editImage: this._onEditImage,
      openTweaks: this._openTweaks,
      toggleEquipClothing: this._toggleEquipClothing,
      toggleMagLoaded: this._toggleMagLoaded,
      rollMutations: this._onMutationRoll,
      openAttributeRoller: this._onOpenAttributeRoller,
      addLocomotive: this._onAddLocomotive,
      removeCrew: this._onRemoveCrew,
      removePassenger: this._onRemovePassenger,
      adjustTherms: this._onAdjustTherms,
      // consumeRations: this._onConsumeRations
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      handler: this.#onSubmitActorForm,
      submitOnChange: true,
    },    
    window: {
      resizable: true
    }
  };

  /** @override */
  static PARTS = {
    headerCharacter: { template: 'systems/railers/templates/actor/headers/character.hbs' },
    headerNpc: { template: 'systems/railers/templates/actor/headers/npc.hbs' },
    headerDemon: { template: 'systems/railers/templates/actor/headers/demon.hbs' },
    headerTrain: { template: 'systems/railers/templates/actor/headers/train.hbs' },
    tabs: { template: 'templates/generic/tab-navigation.hbs' },
    skills: { template: 'systems/railers/templates/actor/skills.hbs', },
    combat: { template: 'systems/railers/templates/actor/combat.hbs' },
    biography: { template: 'systems/railers/templates/actor/biography.hbs' },
    gear: { template: 'systems/railers/templates/actor/gear.hbs' },
    wounds: { template: 'systems/railers/templates/actor/wounds.hbs' },
    survival: { template: 'systems/railers/templates/actor/survival.hbs' },
    effects: { template: 'systems/railers/templates/actor/effects.hbs' },
    cars: { template: 'systems/railers/templates/actor/cars.hbs' },
    notes: { template: 'systems/railers/templates/actor/notes.hbs' },
    abilities: { template: 'systems/railers/templates/actor/abilities.hbs' },
    cargo: { template: 'systems/railers/templates/actor/cargo.hbs' },
    crew: { template: 'systems/railers/templates/actor/crew.hbs' }
  };

    /** @override */
    _configureRenderOptions(options) {
      super._configureRenderOptions(options);
      options.parts = [];

      switch (this.document.type) {
        case 'character':
          options.parts.push('headerCharacter', 'tabs', 'biography', 'skills', 'combat', 'survival', 'gear', 'wounds', 'effects');
          break;
        case 'npc':
          options.parts.push('headerNpc', 'tabs', 'biography', 'combat', 'survival', 'gear', 'wounds', 'effects');
          break;
        case 'demon':
          options.parts.push('headerDemon', 'tabs', 'abilities', 'wounds', 'notes', 'effects');
          break;
        case 'train':
          options.parts.push('headerTrain', 'tabs', 'crew', 'cars', 'cargo', 'notes', 'effects');
          break;
      }

      if (this.document.limited) options.parts = [options.parts[0]];
    }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    // Output initialization
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      actor: this.actor,
      // Add the actor's data to context.data for easier access, as well as flags.
      system: this.actor.system,
      flags: this.actor.flags,
      // Adding a pointer to CONFIG.RAILERS
      config: CONFIG.RAILERS,
      tabs: this._getTabs(options.parts),
      // Necessary for formInput and formFields helpers
      fields: this.document.schema.fields,
      systemFields: this.document.system.schema.fields
    };

    // Offloading context prep to a helper function
    this._prepareItems(context);

    context.locomotiveOptions = CONFIG.RAILERS.locomotiveOptions;

    if (this.actor.type === "train") {
      context.crewMembers = (this.actor.system.crewMembers ?? []).map((member, index) => ({
        ...member,
        actor: game.actors.get(member.actorId),
        index
      })).filter(m => m.actor !== undefined);

      context.passengerMembers = (this.actor.system.passengers?.members ?? []).map((member, index) => ({
        ...member,
        actor: game.actors.get(member.actorId),
        index
      })).filter(m => m.actor !== undefined);
    }

    return context;
  }


  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'headerCharacter':
        context.showHpRollButton = 
          this.actor.type === 'character' &&
          (this.actor.system.attributes.fortitude.value ?? 0) > 
          (this.actor.getFlag('railers', 'lastHpRollFortitude') ?? 0);
        
        context.showAttributeRollerButton =
          this.actor.type === 'character' &&
          Object.keys(CONFIG.RAILERS.attributes.character).every(
            attr => (this.actor.system.attributes[attr].value ?? 0) === 0
          );
        break;
      case 'wounds':
      case 'gear':
      case 'abilities':
      case 'skills':
      case 'combat':
      case 'crew':
      case 'cars':
      case 'cargo':
      case 'survival':
        context.tab = context.tabs[partId];
        break;
      case 'biography':
      context.tab = context.tabs[partId];
      context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        this.actor.system.biography,
        {
          secrets: this.document.isOwner,
          rollData: this.actor.getRollData(),
          relativeTo: this.actor,
        }
      );
      break;
      case 'notes':
        context.tab = context.tabs[partId];
        context.enrichedNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.actor.system.notes,
          {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData(),
            relativeTo: this.actor,
          }
        );
        break;
      case 'effects':
        context.tab = context.tabs[partId];
        // Prepare active effects
        context.effects = prepareActiveEffectCategories(
          // A generator that returns all effects stored on the actor
          // as well as any items
          this.actor.allApplicableEffects()
        );
        break;
    }
    return context;
  }


  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Set default tab based on actor type if not already set
    if (!this.tabGroups[tabGroup]) {
      const defaultTabs = {
        character: 'skills',
        npc: 'biography',
        demon: 'abilities',
        train: 'crew'
      };
      this.tabGroups[tabGroup] = defaultTabs[this.actor.type];
    }
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'RAILERS.Actor.Tabs.',
      };
      switch (partId) {
        case 'headerCharacter':
        case 'headerNpc':
        case 'headerDemon':
        case 'headerTrain':
        case 'tabs':
          return tabs;
        case 'biography':
          tab.id = 'biography';
          tab.label += 'Biography';
          break;
        case 'gear':
          tab.id = 'gear';
          tab.label += 'Gear';
          break;
        case 'combat':
          tab.id = 'combat';
          tab.label += 'Combat';
          break;
        case 'wounds':
          tab.id = 'wounds';
          tab.label += 'Wounds';
          break;
        case 'survival':
          tab.id = 'survival';
          tab.label += 'Survival';
          break;
        case 'effects':
          tab.id = 'effects';
          tab.label += 'Effects';
          break;
        case 'crew':
          tab.id = 'crew';
          tab.label += "Crew";
          break;
        case 'cars':
          tab.id = 'cars';
          tab.label += 'Cars';
          break;
        case 'cargo':
          tab.id = 'cargo';
          tab.label += 'Cargo';
          break;
        case 'skills':
          tab.id = 'skills';
          tab.label += 'Skills';
          break;
        case 'abilities':
          tab.id = 'abilities';
          tab.label += 'Abilities';
          break;
        case 'notes':
          tab.id = 'notes';
          tab.label += 'Notes';
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    const grouped = Object.groupBy(this.document.items, i => i.type);

    const bySort = (a, b) => (a.sort || 0) - (b.sort || 0);

    context.gear = (grouped.gear ?? []).sort(bySort);
    context.mutations = (grouped.mutation ?? []).sort(bySort);
    context.survival = (grouped.survival ?? []).sort(bySort);
    context.abilities = (grouped.ability ?? []).sort(bySort);
    context.cars = (grouped.car ?? []).sort(bySort);
    context.locomotives = (grouped.locomotive ?? []).sort(bySort);
    context.cargo = (grouped.cargo ?? []).sort(bySort);
    context.ammo = (grouped.ammo ?? []).sort(bySort);
    context.magazines = (grouped.magazine ?? []).sort(bySort);
    context.wounds = (grouped.wound ?? []).sort((a, b) => 
      (a.system.severity || 0) - (b.system.severity || 0) || 
      (a.system.damage || 0) - (b.system.damage || 0)
    );

    context.onHandAmmo = (grouped.ammo ?? [])
      .filter(i => i.system.stowage === 'onHand')
      .sort(bySort);
    context.onHandMagazines = (grouped.magazine ?? [])
      .filter(i => i.system.stowage === 'onHand')
      .sort(bySort);
    context.meleeWeapons = (grouped.weapon ?? []).filter(w => w.system.range === 'melee').sort(bySort);
    context.rangedWeapons = (grouped.weapon ?? []).filter(w => w.system.range !== 'melee').sort(bySort);

    const layerOrder = ['headgear', 'innerwear', 'armor', 'outerwear'];
    context.clothing = (grouped.clothing ?? []).sort((a, b) => {
      const aIndex = layerOrder.indexOf(a.system.layer);
      const bIndex = layerOrder.indexOf(b.system.layer);
      // Unknown layers go to the end
      const aOrder = aIndex === -1 ? 999 : aIndex;
      const bOrder = bIndex === -1 ? 999 : bIndex;
      return aOrder - bOrder;
    });

    // For combat tab - on hand only
    context.onHandMeleeWeapons = context.meleeWeapons.filter(w => w.system.stowage === 'onHand');
    context.onHandRangedWeapons = context.rangedWeapons.filter(w => w.system.stowage === 'onHand');
    context.equippedClothing = {
      headgear: (grouped.clothing ?? []).find(c => c.system.layer === 'headgear' && c.system.equipped && c.system.stowage === 'onHand'),
      innerwear: (grouped.clothing ?? []).find(c => c.system.layer === 'innerwear' && c.system.equipped && c.system.stowage === 'onHand'),
      armor: (grouped.clothing ?? []).find(c => c.system.layer === 'armor' && c.system.equipped && c.system.stowage === 'onHand'),
      outerwear: (grouped.clothing ?? []).find(c => c.system.layer === 'outerwear' && c.system.equipped && c.system.stowage === 'onHand'),
    };
  }

  /** @override */
  _getHeaderControls() {
    const controls = super._getHeaderControls();

    controls.push({
      label: game.i18n.localize("RAILERS.apps.actorTweaks.title"),
      title: game.i18n.localize("RAILERS.apps.actorTweaks.title"),
      class: "actor-tweaks",
      icon: "fas fa-wrench",
      action: "openTweaks"
    });

    return controls;
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */

  
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
    this.#disableOverrides();

    const locomotiveSelect = this.element.querySelector('.locomotive-select');
    if (locomotiveSelect) {
      // Restore pending selection if dialog is open
      if (this._locomotivePending) {
        locomotiveSelect.value = this._locomotivePending;
      }
      locomotiveSelect.removeEventListener('change', this._onLocomotiveChange);
      locomotiveSelect.addEventListener('change', this._onLocomotiveChange);
    }

    this.element.querySelectorAll('select[data-action="updateStowage"]').forEach(select => {
      select.addEventListener('change', async (event) => {
        const itemId = event.currentTarget.closest('[data-item-id]')?.dataset.itemId;
        const item = this.document.items.get(itemId);
        if (!item) return;
        await item.update({ 'system.stowage': event.currentTarget.value });
      });
    });

    // Untracked passenger inputs
    const untrackedOpen = this.actor.getFlag("railers", "untrackedPassengersOpen") ?? false;
    const inputs = this.element.querySelector('.untracked-inputs');
    const icon = this.element.querySelector('[data-action="toggleUntracked"] i');
    if (inputs) {
      inputs.style.display = untrackedOpen ? '' : 'none';
      if (icon) icon.className = untrackedOpen ? 'fas fa-check' : 'fas fa-edit';
    }

    this.element.querySelector('[data-action="toggleUntracked"]')?.addEventListener('click', async (e) => {
      const inputs = this.element.querySelector('.untracked-inputs');
      const icon = e.currentTarget.querySelector('i');
      const visible = inputs.style.display !== 'none';
      inputs.style.display = visible ? 'none' : '';
      icon.className = visible ? 'fas fa-edit' : 'fas fa-check';
      await this.actor.setFlag("railers", "untrackedPassengersOpen", !visible);
    });

    // Crew capacity selects
    this.element.querySelectorAll('select[data-action="updateCrewCapacity"]').forEach(select => {
      select.addEventListener('change', async (event) => {
        const index = Number(event.currentTarget.dataset.index);
        const crewMembers = foundry.utils.deepClone(this.actor.system.crewMembers ?? []);
        crewMembers[index].capacityType = event.currentTarget.value;
        await this.actor.update({ "system.crewMembers": crewMembers });
      });
    });

    // Passenger capacity selects
    this.element.querySelectorAll('select[data-action="updatePassengerCapacity"]').forEach(select => {
      select.addEventListener('change', async (event) => {
        const index = Number(event.currentTarget.dataset.index);
        const members = foundry.utils.deepClone(this.actor.system.passengers.members ?? []);
        members[index].capacityType = event.currentTarget.value;
        await this.actor.update({ "system.passengers.members": members });
      });
    });

  }

  /**************
   *
   *   ACTIONS
   *
   **************/

  static async _onRemoveCrew(event, target) {
    const index = Number(target.dataset.index);
    const crewMembers = foundry.utils.deepClone(this.actor.system.crewMembers ?? []);
    crewMembers.splice(index, 1);
    await this.actor.update({ "system.crewMembers": crewMembers });
  }

  static async _onRemovePassenger(event, target) {
    const index = Number(target.dataset.index);
    const members = foundry.utils.deepClone(this.actor.system.passengers.members ?? []);
    members.splice(index, 1);
    await this.actor.update({ "system.passengers.members": members });
  }

  // static async _onConsumeRations(event, target) {
  //   const system = this.actor.system;
  //   const total = (system.crew ?? 0) + (system.totalPassengers ?? 0);
  //   const consumed = total * 2;
  //   const current = system.rations.value ?? 0;

  //   if (consumed === 0) {
  //     ui.notifications.info(game.i18n.localize("RAILERS.Actor.Train.actions.noOneToFeed"));
  //     return;
  //   }

  //   const confirmed = await foundry.applications.api.DialogV2.confirm({
  //     window: { title: game.i18n.localize("RAILERS.Actor.Train.actions.consumeRations") },
  //     content: `<p>${game.i18n.format("RAILERS.Actor.Train.actions.consumeRationsConfirm", { consumed, current })}</p>`,
  //     yes: { label: game.i18n.localize("RAILERS.dialogs.base.confirm"), icon: "fas fa-check" },
  //     no: { label: game.i18n.localize("RAILERS.dialogs.base.cancel"), icon: "fas fa-times" }
  //   });

  //   if (!confirmed) return;

  //   await this.actor.update({
  //     "system.rations.value": Math.max(0, current - consumed)
  //   });

  //   if (current < consumed) {
  //     ui.notifications.warn(game.i18n.format("RAILERS.Actor.Train.actions.rationShortfall", {
  //       shortfall: consumed - current
  //     }));
  //   } else {
  //     ui.notifications.info(game.i18n.format("RAILERS.Actor.Train.actions.rationsConsumed", { consumed }));
  //   }
  // }

  static async _onAddLocomotive(event, target) {
    await locomotiveAdd(this.actor);
  }
  
  static async _onOpenAttributeRoller(event, target) {
    new AttributeRoller({ actor: this.actor }).render(true);
  }

  static async _onMutationRoll(event, target) {
    await rollMutationsDialog(this.actor);
  }

  static async _toggleMagLoaded(event, target) {
    const itemId = target.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;
    await item.update({ 'system.loaded': !item.system.loaded });
  }

  static async _onWeaponReload(event, target) {
    const itemId = target.closest('[data-item-id]')?.dataset.itemId 
      ?? target.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;
    await reloadDialog(this.actor, item);
  }
  
  static async _toggleEquipClothing(event, target) {
    const item = this._getEmbeddedDocument(target);
    const layer = item.system.layer;
    
    // Unequip all other clothing of same layer
    const updates = this.actor.items
      .filter(i => i.type === 'clothing' && i.system.layer === layer && i.id !== item.id)
      .map(i => ({ _id: i.id, 'system.equipped': false }));
    
    await this.actor.updateEmbeddedDocuments('Item', updates);
    await item.update({ 'system.equipped': !item.system.equipped });
  }


  _handleLocomotiveChange(event) {
    this._locomotivePending = event.target.value;
    locomotiveChange(this.actor, event.target.value).then(() => {
      this._locomotivePending = null;
    });
  }
  
  static async _openTweaks(event, target) {
    new ActorTweaks({ actor: this.actor }).render(true);
  }

  static async _addWound(actor) {
    addWoundDialog(this.actor);
  }
  
  static _onWoundHeal(event, target) {
    const itemId = target.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;
  
    const damage = Math.max(0, (item.system.damage || 0) - 1);
    if (damage === 0) {
      item.delete();
    } else {
      item.update({ 'system.damage': damage });
    }
  }

  static async _onAdjustTherms(event, target) {
    const mode = target.dataset.mode;
    await adjustThermsDialog(this.actor, mode);
  }

  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } =
      this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new foundry.applications.apps.FilePicker.implementation({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  /**
   * Renders an embedded document's sheet
   *
   * @this RailersActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
static async _viewDoc(event, target) {
  event.preventDefault();
  event.stopPropagation();

  const doc = this._getEmbeddedDocument(target);
  if (!doc?.sheet) {
    console.warn("No embedded document found for click target", target);
    return;
  }

  doc.sheet.render(true);
}


  /**
   * Handles item deletion
   *
   * @this RailersActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _deleteDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    await doc.delete();
  }

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this RailersActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _createDoc(event, target) {
    // Retrieve the configured document class for Item or ActiveEffect
    const docCls = getDocumentClass(target.dataset.documentClass);
    // Prepare the document creation data by initializing it a default name.
    const docData = {
      name: docCls.defaultName({
        // defaultName handles an undefined type gracefully
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // These data attributes are reserved for the action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      // Nested properties require dot notation in the HTML, e.g. anything with `system`
      // An example exists in spells.hbs, with `data-system.spell-level`
      // which turns into the dataKey 'system.spellLevel'
      foundry.utils.setProperty(docData, dataKey, value);
    }

    // Finally, create the embedded document!
    await docCls.create(docData, { parent: this.actor });
  }

  /**
   * Determines effect parent to pass to helper
   *
   * @this RailersActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async _toggleEffect(event, target) {
    const effect = this._getEmbeddedDocument(target);
    await effect.update({ disabled: !effect.disabled });
  }

  /**
   * Handle clickable rolls.
   *
   * @this RailersActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async _onRoll(event, target) {
    event.preventDefault();
    const dataset = target.dataset;
    const actor = this.actor;
  
    switch (dataset.rollType) {
      case 'item':
        const item = this._getEmbeddedDocument(target);
        if (item) return item.roll();
        break;
  
      case 'stat':
        return rollDialog(actor, target);
  
      case 'attack':
        return attackDialog(actor, target);
  
      case 'defense':
        return defenseDialog(actor);
  
      case 'hp':
        return onRollHp(event, actor);
  
      default:
        if (dataset.roll) {
          let label = dataset.label ? `[ability] ${dataset.label}` : '';
          let roll = new Roll(dataset.roll, actor.getRollData());
          await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: label,
            messageMode: game.settings.get('core', 'messageMode'),
          });
          return roll;
        }
        console.warn(`Unknown roll type: ${dataset.rollType}`);
    }
  }

  /** Helper Functions */

  /**
   * Fetches the embedded document representing the containing HTML element
   *
   * @param {HTMLElement} target    The element subject to search
   * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
   */
  _getEmbeddedDocument(target) {
    const li = target.closest('li') ?? target.closest('[data-item-id]');
    if (!li) return null;

    // --- Active Effects ---
    if (li.dataset.effectId) {
      const effectId = li.dataset.effectId;

      // 1. Actor-owned effect
      let effect = this.actor.effects.get(effectId);
      if (effect) return effect;

      // 2. Item-owned effect
      for (const item of this.actor.items) {
        effect = item.effects.get(effectId);
        if (effect) return effect;
      }

      return null;
    }

    // --- Items ---
    if (li.dataset.itemId) {
      return this.actor.items.get(li.dataset.itemId) ?? null;
    }

    return null;
  }


  /***************
   *
   * Drag and Drop
   *
   ***************/

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const docRow = event.currentTarget.closest('li') 
      ?? event.currentTarget.closest('[data-item-id]')
      ?? event.currentTarget.closest('[data-effect-id]');
    
    if ('link' in event.target.dataset) return;
    if (!docRow) return;

    const dragData = this._getEmbeddedDocument(docRow)?.toDragData();
    if (!dragData) return;

    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event, target) { }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event, target) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
    }
  }

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor)
      return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, { parent: this.actor });
  }

  /**
   * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  async _onSortActiveEffect(event, effect) {
    /** @type {HTMLElement} */
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = this._getEmbeddedDocument(dropTarget);

    // Don't sort on yourself
    if (effect.uuid === target.uuid) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      const parentId = el.dataset.parentId;
      if (
        siblingId &&
        parentId &&
        (siblingId !== effect.id || parentId !== effect.parent.id)
      )
        siblings.push(this._getEmbeddedDocument(el));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });

    // Split the updates up by parent document
    const directUpdates = [];

    const grandchildUpdateData = sortUpdates.reduce((items, u) => {
      const parentId = u.target.parent.id;
      const update = { _id: u.target.id, ...u.update };
      if (parentId === this.actor.id) {
        directUpdates.push(update);
        return items;
      }
      if (items[parentId]) items[parentId].push(update);
      else items[parentId] = [update];
      return items;
    }, {});

    // Effects-on-items updates
    for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
      await this.actor.items
        .get(itemId)
        .updateEmbeddedDocuments('ActiveEffect', updates);
    }

    // Update on the main actor
    return this.actor.updateEmbeddedDocuments('ActiveEffect', directUpdates);
  }

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;

    const actor = await fromUuid(data.uuid);
    if (!actor) return;

    if (!["character", "npc"].includes(actor.type)) {
      return;
    }
    // Determine if drop is on crew or passenger list
    const target = event.target.closest('.crew-section');
    if (!target) return;

    const isCrew = target.dataset.section === "crew";
    const actorId = actor.id;

    if (isCrew) {
      const crewMembers = foundry.utils.deepClone(this.actor.system.crewMembers ?? []);
      if (crewMembers.some(m => m.actorId === actorId)) {
        ui.notifications.warn(game.i18n.localize("RAILERS.Actor.Train.actions.alreadyCrew"));
        return;
      }
      crewMembers.push({ actorId, capacityType: "standardCoach" });
      await this.actor.update({ "system.crewMembers": crewMembers });
    } else {
      const members = foundry.utils.deepClone(this.actor.system.passengers.members ?? []);
      if (members.some(m => m.actorId === actorId)) {
        ui.notifications.warn(game.i18n.localize("RAILERS.Actor.Train.actions.alreadyPassenger"));
        return;
      }
      members.push({ actorId, capacityType: "standardCoach" });
      await this.actor.update({ "system.passengers.members": members });
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, item);

    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', itemData);
  }

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * @param {Event} event
   * @param {Item} item
   * @private
   */
  _onSortItem(event, item) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const dropTarget = event.target.closest('[data-item-id]');
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (item.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== item.id)
        siblings.push(items.get(el.dataset.itemId));
    }

    // Perform the sort
    const sortUpdates = foundry.utils.performIntegerSort(item, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.actor.updateEmbeddedDocuments('Item', updateData);
  }

  /** The following pieces set up drag handling and are unlikely to need modification  */

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop.implementation(d);
    });
  }

   /********************
   *
   * Actor Override Handling
   *
   ********************/

  /**
   * Process form submission for the sheet, removing overrides created by active effects
   * @this {RailersActorSheet}                The handler is called with the application as its bound scope
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {FormDataExtended} formData           Processed data for the submitted form
   * @returns {Promise<void>}
   */
  static async #onSubmitActorForm(event, form, formData) {
    const submitData = this._prepareSubmitData(event, form, formData);
    const overrides = foundry.utils.flattenObject(this.actor.overrides);
    for (let k of Object.keys(overrides)) delete submitData[k];
    await this.actor.update(submitData);
  }

  /**
   * Disables inputs subject to active effects
   */
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) {
        input.disabled = true;
      }
    }
  }
}


