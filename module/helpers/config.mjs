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
      endurance: 'RAILERS.Attributes.Endurance',
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
        img: 'systems/railers/assets/icons/demon-icon.svg',
        texture: { src: 'systems/railers/assets/icons/demon-icon.svg' },
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
      magazine: {
        img: 'systems/railers/assets/icons/magazine-icon.svg',
      },
      ammo: {
        img: 'systems/railers/assets/icons/ammo-icon.svg',
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
  RAILERS.locomotiveStats = {
    ace:        { armor: 4, power: 24, speed: 7, fuel: 100, weight: 1050, capacity: 0 },
    bigBrother: { armor: 5, power: 15, speed: 3, fuel: 60,  weight: 950,  capacity: 0 },
    comet:      { armor: 2, power: 12, speed: 9, fuel: 42,  weight: 650,  capacity: 0 },
    compact:    { armor: 3, power: 0,  speed: 3, fuel: 48,  weight: 0,    capacity: 8 },
    donkey:     { armor: 3, power: 10, speed: 8, fuel: 80,  weight: 1500, capacity: 0 },
    dynamo:     { armor: 4, power: 25, speed: 5, fuel: 56,  weight: 750,  capacity: 0 },
    flex:       { armor: 2, power: 8,  speed: 3, fuel: 36,  weight: 500,  capacity: 0 },
    joes:       { armor: 3, power: 15, speed: 5, fuel: 70,  weight: 800,  capacity: 0 },
    littleMan:  { armor: 1, power: 9,  speed: 3, fuel: 60,  weight: 550,  capacity: 0 },
    marathoner: { armor: 1, power: 16, speed: 4, fuel: 128, weight: 700,  capacity: 0 }
  },
  RAILERS.seasons= {
    "summer": "RAILERS.apps.weather.summer",
    "winter": "RAILERS.apps.weather.winter"
  },
  RAILERS.ammoTypes = {
    handgun: 'RAILERS.Item.Ammo.FIELDS.ammoType.handgun',
    rifle:   'RAILERS.Item.Ammo.FIELDS.ammoType.rifle',
    shotgun: 'RAILERS.Item.Ammo.FIELDS.ammoType.shotgun',
    heavy:   'RAILERS.Item.Ammo.FIELDS.ammoType.heavy',
    arrow:   'RAILERS.Item.Ammo.FIELDS.ammoType.arrow',
    bolt:    'RAILERS.Item.Ammo.FIELDS.ammoType.bolt',
    shell:   'RAILERS.Item.Ammo.FIELDS.ammoType.shell',
    burst:   'RAILERS.Item.Ammo.FIELDS.ammoType.burst'
  };
  RAILERS.magTypes = {
    box:      'RAILERS.Item.Magazine.FIELDS.magType.box',
    drum:     'RAILERS.Item.Magazine.FIELDS.magType.drum',
    clip:     'RAILERS.Item.Magazine.FIELDS.magType.clip',
    belt:     'RAILERS.Item.Magazine.FIELDS.magType.belt',
    quiver:   'RAILERS.Item.Magazine.FIELDS.magType.quiver',
    tank:     'RAILERS.Item.Magazine.FIELDS.magType.tank'
  };
   RAILERS.weaponMagTypes = {
    internal: 'RAILERS.Item.Weapon.FIELDS.magType.internal',
    external: 'RAILERS.Item.Weapon.FIELDS.magType.external',
    belt:     'RAILERS.Item.Weapon.FIELDS.magType.belt',
    clip:     'RAILERS.Item.Weapon.FIELDS.magType.clip',
    tank:     'RAILERS.Item.Weapon.FIELDS.magType.tank',
    quiver:   'RAILERS.Item.Weapon.FIELDS.magType.quiver',
  };
  RAILERS.ammoCapacity = {
    handgun: 50,
    rifle:   20,
    shotgun: 25,
    heavy:   20,
    arrow:   20,
    bolt:    20,
    shell:   1,
    burst:   6
  };
  RAILERS.drumMultiplier = 3;
