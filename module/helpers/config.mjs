export const RAILERS = {};

  RAILERS.attributes = {
    character: {
      combat: 'RAILERS.Attributes.Combat',
      education: 'RAILERS.Attributes.Education',
      engineering: 'RAILERS.Attributes.Engineering',
      fortitude: 'RAILERS.Attributes.Fortitude',
      intuition: 'RAILERS.Attributes.Intuition',
      prowess: 'RAILERS.Attributes.Prowess',
      speech: 'RAILERS.Attributes.Speech',
      stealth: 'RAILERS.Attributes.Stealth'
    },
    npc: {
      primary: 'RAILERS.Attributes.Primary',
      secondary: 'RAILERS.Attributes.Secondary'
    },
    demon: {
      strength: 'RAILERS.Attributes.Strength',
      agility: 'RAILERS.Attributes.Agility',
      intellect: 'RAILERS.Attributes.Intellect',
      endurance: 'RAILERS.Attributes.Endurance'
    }
  }
  RAILERS.skills = {
    combat: {
      bows: 'RAILERS.Skills.Bows',
      heavyweapons: 'RAILERS.Skills.HeavyWeapons',
      melee: 'RAILERS.Skills.Melee',
      smallarms: 'RAILERS.Skills.SmallArms'
    },
    education: {
      instruction: 'RAILERS.Skills.Instruction',
      knowledge: 'RAILERS.Skills.Knowledge',
      medical: 'RAILERS.Skills.Medical',
      survival: 'RAILERS.Skills.Survival'
    },
    engineering: {
      chemistry: 'RAILERS.Skills.Chemistry',
      demolition: 'RAILERS.Skills.Demolition',
      gunsmithing: 'RAILERS.Skills.Gunsmithing',
      locksmithing: 'RAILERS.Skills.Locksmithing',
      locomotive: 'RAILERS.Skills.Locomotive',
      mechanics: 'RAILERS.Skills.Mechanics'
    },
    fortitude: {
      endurance: 'RAILERS.Skills.Endurance',
      resolve: 'RAILERS.Skills.Resolve'
    },
    intuition: {
      insight: 'RAILERS.Skills.Insight',
      perception: 'RAILERS.Skills.Perception'
    },
    prowess: {
      acrobatics: 'RAILERS.Skills.Acrobatics',
      athletics: 'RAILERS.Skills.Athletics',
      exertion: 'RAILERS.Skills.Exertion'
    },
    speech: {
      coercion: 'RAILERS.Skills.Coercion',
      deception: 'RAILERS.Skills.Deception',
      leadership: 'RAILERS.Skills.Leadership',
      negotiation: 'RAILERS.Skills.Negotiation',
      persuasion: 'RAILERS.Skills.Persuasion'
    },
    stealth: {
      concealment: 'RAILERS.Skills.Concealment',
      disguise: 'RAILERS.Skills.Disguise',
      sleightofhand: 'RAILERS.Skills.SleightOfHand',
      sneaking: 'RAILERS.Skills.Sneaking'
    }
  },
  RAILERS.defaultImages = {
    actors: {
      character: {
        img: 'icons/svg/mystery-man.svg',
        texture: { src: 'icons/svg/mystery-man.svg' },
      },
      npc: {
        img: 'icons/svg/mystery-man.svg',
        texture: { src: 'icons/svg/mystery-man.svg' },
      },
      demon: {
        img: 'icons/svg/mystery-man.svg',
        texture: { src: 'icons/svg/mystery-man.svg' },
      },
      train: {
        img: 'systems/railers/assets/icons/train-icon-white.svg',
        texture: { src: 'systems/railers/assets/icons/train-icon-black.svg' },
      },
      default: {
        img: 'icons/svg/mystery-man.svg',
        texture: { src: 'icons/svg/mystery-man.svg' },
      },
    },
    items: {
      gear: {
        img: 'icons/svg/item-bag.svg',
      },
      wound: {
        img: 'icons/svg/blood.svg',
      },
      weapon: {
        img: 'systems/railers/assets/icons/weapon-icon.svg',
      },
      clothing: {
        img: 'systems/railers/assets/icons/coat-icon.svg',
      },
      condition: {
        img: 'icons/svg/aura.svg',
      },
      mutation: {
        img: 'systems/railers/assets/icons/mutation-icon.svg',
      },
      car: {
        img: 'systems/railers/assets/icons/car-icon.svg',
      },
      cargo: {
        img: 'systems/railers/assets/icons/cargo-icon.svg',
      },
      ability: {
        img: 'icons/svg/aura.svg',
      },
      default: {
        img: 'icons/svg/item-bag.svg',
      }
    }
  },
  RAILERS.stowageOptions = {
    "onHand": "RAILERS.Item.base.FIELDS.stowage.type.onHand",
    "stowed": "RAILERS.Item.base.FIELDS.stowage.type.stowed",
    "other": "RAILERS.Item.base.FIELDS.stowage.type.other"
  },
  RAILERS.actionTypeOptions= {
    "na": "RAILERS.Item.Ability.FIELDS.action.types.na",
    "passive": "RAILERS.Item.Ability.FIELDS.action.types.passive",
    "maneuver": "RAILERS.Item.Ability.FIELDS.action.types.maneuver",
    "minor": "RAILERS.Item.Ability.FIELDS.action.types.minor",
    "major": "RAILERS.Item.Ability.FIELDS.action.types.major",
    "full": "RAILERS.Item.Ability.FIELDS.action.types.full"
  },
  RAILERS.rangeOptions= {
    "melee": "RAILERS.Item.Weapon.FIELDS.range.types.melee",
    "short": "RAILERS.Item.Weapon.FIELDS.range.types.short",
    "medium": "RAILERS.Item.Weapon.FIELDS.range.types.medium",
    "long": "RAILERS.Item.Weapon.FIELDS.range.types.long",
    "extreme": "RAILERS.Item.Weapon.FIELDS.range.types.extreme"
  },
  RAILERS.weaponSkillOptions= {
    "bows": 'RAILERS.Skills.Bows',
    "heavyweapons": 'RAILERS.Skills.HeavyWeapons',
    "melee": 'RAILERS.Skills.Melee',
    "smallarms": 'RAILERS.Skills.SmallArms',
    "exertion": 'RAILERS.Skills.Exertion'
  },
  RAILERS.clothingTypeOptions= {
    "headgear": "RAILERS.Item.Clothing.FIELDS.layer.type.headgear",
    "innerwear": "RAILERS.Item.Clothing.FIELDS.layer.type.innerwear",
    "armor": "RAILERS.Item.Clothing.FIELDS.layer.type.armor",
    "outerwear": "RAILERS.Item.Clothing.FIELDS.layer.type.outerwear"
  },
  RAILERS.locomotiveOptions= {
    "ace": "RAILERS.Actor.Train.FIELDS.locomotives.ace",
    "bigBrother": "RAILERS.Actor.Train.FIELDS.locomotives.bigBrother",
    "comet": "RAILERS.Actor.Train.FIELDS.locomotives.comet",
    "compact": "RAILERS.Actor.Train.FIELDS.locomotives.compact",
    "donkey": "RAILERS.Actor.Train.FIELDS.locomotives.donkey",
    "dynamo": "RAILERS.Actor.Train.FIELDS.locomotives.dynamo",
    "flex": "RAILERS.Actor.Train.FIELDS.locomotives.flex",
    "joes": "RAILERS.Actor.Train.FIELDS.locomotives.joes",
    "littleMan": "RAILERS.Actor.Train.FIELDS.locomotives.littleMan",
    "marathoner": "RAILERS.Actor.Train.FIELDS.locomotives.marathoner"
  },
  RAILERS.seasons= {
    "summer": "RAILERS.apps.weather.summer",
    "winter": "RAILERS.apps.weather.winter"
  }
