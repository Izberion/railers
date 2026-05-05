export const TERRAIN_TYPES = {
  "snowhex.svg":     "RAILERS.apps.terrain.snowTerrain",
  "hillhex.svg":     "RAILERS.apps.terrain.hillTerrain",
  "icehex.svg":      "RAILERS.apps.terrain.iceTerrain",
  "flathex.svg":     "RAILERS.apps.terrain.flatTerrain",
  "mountainhex.svg": "RAILERS.apps.terrain.mountainTerrain"
};

export const WEATHER_TYPES = {
  "thundersnowhex.svg":   { name: "RAILERS.apps.weather.thunderSnow",   desc: "RAILERS.apps.weather.description.thunderSnow" },
  "snowstormhex.svg":     { name: "RAILERS.apps.weather.snowStorm",     desc: "RAILERS.apps.weather.description.snowStorm" },
  "blizzardhex.svg":      { name: "RAILERS.apps.weather.blizzard",      desc: "RAILERS.apps.weather.description.blizzard" },
  "windhex.svg":          { name: "RAILERS.apps.weather.wind",          desc: "RAILERS.apps.weather.description.wind" },
  "flurryhex.svg":        { name: "RAILERS.apps.weather.flurry",        desc: "RAILERS.apps.weather.description.flurry" },
  "overcasthex.svg":      { name: "RAILERS.apps.weather.overcast",      desc: "RAILERS.apps.weather.description.overcast" },
  "polaroutbreakhex.svg": { name: "RAILERS.apps.weather.polarOutbreak", desc: "RAILERS.apps.weather.description.polarOutbreak" },
  "aurorahex.svg":        { name: "RAILERS.apps.weather.aurora",        desc: "RAILERS.apps.weather.description.aurora" },
  "clearhex.svg":         { name: "RAILERS.apps.weather.clear",         desc: "RAILERS.apps.weather.description.clear" },
  "icefoghex.svg":        { name: "RAILERS.apps.weather.iceFog",        desc: "RAILERS.apps.weather.description.iceFog" },
  "diamonddusthex.svg":   { name: "RAILERS.apps.weather.diamondDust",   desc: "RAILERS.apps.weather.description.diamondDust" },
  "whiteouthex.svg":      { name: "RAILERS.apps.weather.whiteout",      desc: "RAILERS.apps.weather.description.whiteout" }
};

export const HEX_DATA = [
  { coords: "(0,0)", src: "systems/railers/assets/tiles/snowhex.svg" },
  { coords: "(0,1)", src: "systems/railers/assets/tiles/hillhex.svg" },
  { coords: "(0,2)", src: "systems/railers/assets/tiles/icehex.svg" },
  { coords: "(1,0)", src: "systems/railers/assets/tiles/hillhex.svg" },
  { coords: "(1,1)", src: "systems/railers/assets/tiles/flathex.svg" },
  { coords: "(1,2)", src: "systems/railers/assets/tiles/flathex.svg" },
  { coords: "(1,3)", src: "systems/railers/assets/tiles/mountainhex.svg" },
  { coords: "(2,0)", src: "systems/railers/assets/tiles/mountainhex.svg" },
  { coords: "(2,1)", src: "systems/railers/assets/tiles/flathex.svg" },
  { coords: "(2,2)", src: "systems/railers/assets/tiles/flathex.svg" },
  { coords: "(2,3)", src: "systems/railers/assets/tiles/flathex.svg" },
  { coords: "(2,4)", src: "systems/railers/assets/tiles/mountainhex.svg" },
  { coords: "(3,0)", src: "systems/railers/assets/tiles/hillhex.svg" },
  { coords: "(3,1)", src: "systems/railers/assets/tiles/flathex.svg" },
  { coords: "(3,2)", src: "systems/railers/assets/tiles/flathex.svg" },
  { coords: "(3,3)", src: "systems/railers/assets/tiles/hillhex.svg" },
  { coords: "(4,0)", src: "systems/railers/assets/tiles/snowhex.svg" },
  { coords: "(4,1)", src: "systems/railers/assets/tiles/hillhex.svg" },
  { coords: "(4,2)", src: "systems/railers/assets/tiles/icehex.svg" }
];

export const WEATHER_DATA = [
  { coords: "(0,0)", image: "systems/railers/assets/weather/thundersnowhex.svg" },
  { coords: "(0,1)", image: "systems/railers/assets/weather/snowstormhex.svg" },
  { coords: "(0,2)", image: "systems/railers/assets/weather/blizzardhex.svg" },
  { coords: "(1,0)", image: "systems/railers/assets/weather/windhex.svg" },
  { coords: "(1,1)", image: "systems/railers/assets/weather/flurryhex.svg" },
  { coords: "(1,2)", image: "systems/railers/assets/weather/overcasthex.svg" },
  { coords: "(1,3)", image: "systems/railers/assets/weather/polaroutbreakhex.svg" },
  { coords: "(2,0)", image: "systems/railers/assets/weather/aurorahex.svg" },
  { coords: "(2,1)", image: "systems/railers/assets/weather/clearhex.svg" },
  { coords: "(2,2)", image: "systems/railers/assets/weather/clearhex.svg" },
  { coords: "(2,3)", image: "systems/railers/assets/weather/clearhex.svg" },
  { coords: "(2,4)", image: "systems/railers/assets/weather/icefoghex.svg" },
  { coords: "(3,0)", image: "systems/railers/assets/weather/blizzardhex.svg" },
  { coords: "(3,1)", image: "systems/railers/assets/weather/overcasthex.svg" },
  { coords: "(3,2)", image: "systems/railers/assets/weather/flurryhex.svg" },
  { coords: "(3,3)", image: "systems/railers/assets/weather/windhex.svg" },
  { coords: "(4,0)", image: "systems/railers/assets/weather/diamonddusthex.svg" },
  { coords: "(4,1)", image: "systems/railers/assets/weather/snowstormhex.svg" },
  { coords: "(4,2)", image: "systems/railers/assets/weather/whiteouthex.svg" }
];

export const hexes = {
  "(0,0)": ["(1,0)", "(1,1)", "(0,1)", "(2,0)", "(4,2)", "(0,2)"],
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