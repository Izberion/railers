export default class RailersItemBase extends foundry.abstract.TypeDataModel {
  
  static LOCALIZATION_PREFIXES = ['RAILERS.Item.base'];
  
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};
    
    schema.description = new fields.HTMLField({
      required: true,
      blank: true
    });

    schema.name = new fields.StringField({
      required: true,
      blank: true,
    });

    schema.rollFormula = new fields.StringField({
      required: false,
      nullable: true,
      blank: true,
      initial: null
    });

    schema.numDice = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: null,
      min: 0
    });

    schema.therms = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: null,
      min: 0
    });

    schema.load = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: 0,
      min: 0
    });

    schema.quantity = new fields.NumberField({
      required: false,
      nullable: true,
      integer: true,
      initial: 0,
      min: 0
    });

    schema.stowage = new fields.StringField({
      required: false,
      nullable: true,
      blank: true,
      initial: "other",
      choices: Object.keys(CONFIG.RAILERS.stowageOptions)
    });

    return schema;
  }

  get localizedStowage() {
    if (!this.stowage) return "";
    const key = CONFIG.RAILERS.stowageOptions[this.stowage] || this.stowage;
    return game.i18n.localize(key);
  }
  
}