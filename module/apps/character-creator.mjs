const { api } = foundry.applications;

export class CharacterCreator extends api.HandlebarsApplicationMixin(api.ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.data = {
      pointsTotal: 100,
      pointsSpent: 0,
      useMutation: false,
      attributes: {},
      hitpoints: { max: 12 },
      nerve: { value: 20, max: 20 },
      therms: 200,
      mutation: null,
    };
    this.persistedMutation = null;
    this.loadSavedState();
    this.initializeData();
  }

  static DEFAULT_OPTIONS = {
    classes: ['railers', 'character-creator'],
    tag: 'form',
    window: { title: 'RAILERS.apps.character.creator', resizable: true },
    position: { width: 800, height: 'auto' },
    actions: {
      createCharacter: this._createCharacter,
      toggleMutation: this._toggleMutation
    },
  };

  static PARTS = {
    form: { template: 'systems/railers/templates/apps/character-creator.hbs' },
  };

  loadSavedState() {
    const savedState = this.actor.getFlag('railers', 'creatorState');
    if (savedState) {
      this.data = foundry.utils.mergeObject(this.data, savedState.data, { recursive: true });
      this.persistedMutation = savedState.persistedMutation || null;
    }
  }

  async saveState() {
    const dataToSave = {
      pointsTotal: this.data.pointsTotal,
      pointsSpent: this.data.pointsSpent,
      useMutation: this.data.useMutation,
      attributes: {},
      hitpoints: { max: this.data.hitpoints.max },
      nerve: { value: this.data.nerve.value, max: this.data.nerve.max },
      therms: this.data.therms,
      mutation: this.data.mutation,
    };
    for (const attrKey in this.data.attributes) {
      dataToSave.attributes[attrKey] = {
        value: this.data.attributes[attrKey].value,
        skills: {},
      };
      for (const skillKey in this.data.attributes[attrKey].skills) {
        dataToSave.attributes[attrKey].skills[skillKey] = {
          value: this.data.attributes[attrKey].skills[skillKey].value,
        };
      }
    }
    await this.actor.setFlag('railers', 'creatorState', {
      data: dataToSave,
      persistedMutation: this.persistedMutation,
    });
  }

  async clearState() {
    await this.actor.unsetFlag('railers', 'creatorState');
  }

  initializeData() {
    if (Object.keys(this.data.attributes).length === 0) {
      this.data.attributes = {};
      for (const attrKey of Object.keys(CONFIG.RAILERS.attributes.character)) {
        this.data.attributes[attrKey] = {
          value: this.data.attributes[attrKey]?.value || 0,
          label: game.i18n.localize(CONFIG.RAILERS.attributes.character[attrKey]),
          skills: {},
        };
        const skills = CONFIG.RAILERS.skills[attrKey] || {};
        for (const skillKey of Object.keys(skills)) {
          this.data.attributes[attrKey].skills[skillKey] = {
            value: this.data.attributes[attrKey]?.skills[skillKey]?.value || 0,
            label: game.i18n.localize(skills[skillKey]),
          };
        }
      }
    } else {
      for (const attrKey in this.data.attributes) {
        this.data.attributes[attrKey].label = game.i18n.localize(CONFIG.RAILERS.attributes.character[attrKey]);
        for (const skillKey in this.data.attributes[attrKey].skills) {
          this.data.attributes[attrKey].skills[skillKey].label = game.i18n.localize(CONFIG.RAILERS.skills[attrKey][skillKey]);
        }
      }
    }
    this.calculatePointsSpent();
  }

  calculatePointsSpent() {
    let spent = 0;
    for (const attrKey in this.data.attributes) {
      spent += (this.data.attributes[attrKey].value || 0) * 5;
      const skills = this.data.attributes[attrKey].skills || {};
      for (const skillKey in skills) {
        spent += (skills[skillKey].value || 0) * 3;
      }
    }
    spent += Math.floor(Math.max(0, this.data.hitpoints.max - 12) / 2) * 2;
    spent += Math.floor(Math.max(0, this.data.nerve.max - 20) / 4) * 2;
    spent += Math.floor(Math.max(0, this.data.therms - 200) / 5);
    this.data.pointsSpent = spent;
  }

  async _updateAttribute(event) {
    const target = event.currentTarget;
    const attrKey = target.dataset.attribute;
    if (!attrKey) {
      ui.notifications.error('Attribute key missing');
      return;
    }
    const value = Math.max(0, Math.min(10, parseInt(target.value) || 0));
    this.data.attributes[attrKey].value = value;
    const skills = this.data.attributes[attrKey].skills || {};
    for (const skillKey in skills) {
      skills[skillKey].value = Math.min(skills[skillKey].value, value);
    }
    this.calculatePointsSpent();
    await this.saveState();
    setTimeout(() => this.render(), 0);
  }

  async _updateSkill(event) {
    const target = event.currentTarget;
    const attrKey = target.dataset.attribute;
    const skillKey = target.dataset.skill;
    if (!attrKey || !skillKey) {
      ui.notifications.error('Skill key missing');
      return;
    }
    const max = this.data.attributes[attrKey].value || 0;
    const value = Math.max(0, Math.min(max, parseInt(target.value) || 0));
    this.data.attributes[attrKey].skills[skillKey].value = value;
    this.calculatePointsSpent();
    await this.saveState();
    setTimeout(() => this.render(), 0);
  }

  async _updateHitpoints(event) {
    const target = event.currentTarget;
    const value = Math.max(12, parseInt(target.value) || 12);
    this.data.hitpoints.max = Math.floor(value / 2) * 2;
    this.calculatePointsSpent();
    await this.saveState();
    setTimeout(() => this.render(), 0);
  }

  async _updateNerve(event) {
    const target = event.currentTarget;
    const value = Math.max(20, parseInt(target.value) || 20);
    this.data.nerve.max = Math.floor(value / 4) * 4;
    this.data.nerve.value = this.data.nerve.max;
    this.calculatePointsSpent();
    await this.saveState();
    setTimeout(() => this.render(), 0);
  }

  async _updateTherms(event) {
    const target = event.currentTarget;
    const value = Math.max(200, parseInt(target.value) || 200);
    this.data.therms = Math.floor(value / 5) * 5;
    this.calculatePointsSpent();
    await this.saveState();
    setTimeout(() => this.render(), 0);
  }

  async rollMutation() {
    const table = game.tables.getName('Mutations');
    if (!table) {
      ui.notifications.warn(game.i18n.localize('RAILERS.apps.character.tableNotFound'));
      return;
    }
    const result = await table.draw({ displayChat: false });
    const tableResult = result.results[0];
    if (tableResult.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM && tableResult.documentCollection) {
      const compendium = game.packs.get(tableResult.documentCollection);
      if (compendium) {
        const item = await compendium.getDocument(tableResult.documentId);
        if (item) {
          this.persistedMutation = {
            uuid: item.uuid,
            name: item.name,
            data: item.toObject(),
          };
          this.data.mutation = { name: item.name };
          await this.saveState();
          return;
        }
      }
    }
    const mutationName = tableResult.text || 'Unknown Mutation';
    this.persistedMutation = {
      name: mutationName,
      data: { name: mutationName, type: 'mutation' },
    };
    this.data.mutation = { name: mutationName };
    await this.saveState();
  }

  static async _createCharacter(event, target) {
    event.preventDefault();
    const instance = this;
    if (instance.data.pointsSpent > instance.data.pointsTotal) {
      ui.notifications.error(game.i18n.format('RAILERS.apps.Character.PointsExceeded', {
        spent: instance.data.pointsSpent,
        total: instance.data.pointsTotal,
      }));
      return;
    }

    const pointsRemaining = instance.data.pointsTotal - instance.data.pointsSpent;
    if (pointsRemaining > 0) {
      const result = await api.DialogV2.prompt({
        content: game.i18n.format('RAILERS.apps.character.createWarning', { remaining: pointsRemaining }),
        modal: true,
        window: { title: game.i18n.localize('RAILERS.dialogs.base.warning') },
        rejectClose: false,
        ok: {
          label: game.i18n.localize('RAILERS.dialogs.base.continue'),
          callback: () => 'confirm',
        },
        buttons: [
          {
            label: `<i class="fas fa-times"></i> ${game.i18n.localize('RAILERS.dialogs.base.cancel')}`,
            name: 'cancel',
            callback: () => 'cancel',
          },
        ],
      });

      if (result !== 'confirm') return;
    }

    const updateData = {
      'system.attributes': {},
      'system.hitpoints.max': instance.data.hitpoints.max,
      'system.nerve.value': instance.data.nerve.value,
      'system.nerve.max': instance.data.nerve.max,
      'system.therms': instance.data.therms,
      'system.corruption': instance.data.useMutation ? 20 : 0,
    };

    for (const attrKey in instance.data.attributes) {
      updateData['system.attributes'][attrKey] = {
        value: instance.data.attributes[attrKey].value,
        skills: {},
      };
      for (const skillKey in instance.data.attributes[attrKey].skills) {
        updateData['system.attributes'][attrKey].skills[skillKey] = {
          value: instance.data.attributes[attrKey].skills[skillKey].value,
        };
      }
    }

    await instance.actor.update(updateData);

    if (instance.data.useMutation && instance.persistedMutation) {
      await Item.createDocuments([instance.persistedMutation.data], { parent: instance.actor });
    }

    await instance.actor.setFlag('railers', 'isCreated', true);
    await instance.clearState();
    ui.notifications.info(game.i18n.localize('RAILERS.apps.character.created'));
    instance.close();
  }

  static async _toggleMutation(event, target) {
    event.preventDefault();
    const instance = this;
    instance.data.useMutation = target.checked;
    instance.data.pointsTotal = instance.data.useMutation ? 125 : 100;
    if (instance.data.useMutation) {
      if (instance.persistedMutation) {
        instance.data.mutation = { name: instance.persistedMutation.name };
      } else if (!instance.data.mutation) {
        await instance.rollMutation();
      }
    } else {
      instance.data.mutation = null;
    }
    instance.calculatePointsSpent();
    await instance.saveState();
    await instance.render();
  }

  async _onClose(options) {
    if (!this.actor.getFlag('railers', 'isCreated')) {
      await this.saveState();
    }
    super._onClose(options);
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const form = this.element.querySelector('.character-creator');
    if (!form) {
      ui.notifications.error('Form not found');
      return;
    }

    // Preserve focus after render
    const activeElement = document.activeElement;
    const activeName = activeElement?.name;

    // Attribute inputs
    form.querySelectorAll('input[data-type="attribute"]').forEach((el) => {
      el.removeEventListener('change', this._updateAttribute.bind(this));
      el.addEventListener('change', this._updateAttribute.bind(this));
      el.removeEventListener('focus', this._onInputFocus.bind(this));
      el.addEventListener('focus', this._onInputFocus.bind(this));
    });

    // Skill inputs
    form.querySelectorAll('input[data-type="skill"]').forEach((el) => {
      el.removeEventListener('change', this._updateSkill.bind(this));
      el.addEventListener('change', this._updateSkill.bind(this));
      el.removeEventListener('focus', this._onInputFocus.bind(this));
      el.addEventListener('focus', this._onInputFocus.bind(this));
    });

    // Hitpoints input
    const hitpointsInput = form.querySelector('input[data-type="hitpoints"]');
    if (hitpointsInput) {
      hitpointsInput.removeEventListener('change', this._updateHitpoints.bind(this));
      hitpointsInput.addEventListener('change', this._updateHitpoints.bind(this));
      hitpointsInput.removeEventListener('focus', this._onInputFocus.bind(this));
      hitpointsInput.addEventListener('focus', this._onInputFocus.bind(this));
    }

    // Nerve input
    const nerveInput = form.querySelector('input[data-type="nerve"]');
    if (nerveInput) {
      nerveInput.removeEventListener('change', this._updateNerve.bind(this));
      nerveInput.addEventListener('change', this._updateNerve.bind(this));
      nerveInput.removeEventListener('focus', this._onInputFocus.bind(this));
      nerveInput.addEventListener('focus', this._onInputFocus.bind(this));
    }

    // Therms input
    const thermsInput = form.querySelector('input[data-type="therms"]');
    if (thermsInput) {
      thermsInput.removeEventListener('change', this._updateTherms.bind(this));
      thermsInput.addEventListener('change', this._updateTherms.bind(this));
      thermsInput.removeEventListener('focus', this._onInputFocus.bind(this));
      thermsInput.addEventListener('focus', this._onInputFocus.bind(this));
    }

    if (activeName) {
      const newInput = form.querySelector(`input[name="${activeName}"]`);
      if (newInput && newInput !== activeElement) {
        newInput.focus();
        newInput.select();
      }
    }
  }

  _onInputFocus(event) {
    event.currentTarget.select();
  }

  async _prepareContext() {
    return {
      data: this.data,
      config: CONFIG.RAILERS,
      pointsRemaining: this.data.pointsTotal - this.data.pointsSpent,
    };
  }
}