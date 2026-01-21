/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    "systems/railers/templates/actor/parts/actor-skills.hbs",
    "systems/railers/templates/actor/parts/actor-gear.hbs",
    "systems/railers/templates/actor/parts/actor-wounds.hbs",
    "systems/railers/templates/actor/parts/actor-effects.hbs",
    "systems/railers/templates/actor/parts/actor-bio.hbs",
    "systems/railers/templates/actor/parts/actor-cars.hbs",
    "systems/railers/templates/actor/parts/actor-cargo.hbs",
    "systems/railers/templates/actor/parts/actor-notes.hbs",
    "systems/railers/templates/actor/parts/actor-abilities.hbs",
    "systems/railers/templates/apps/terrain-flower.hbs",
    "systems/railers/templates/apps/weather-hud.hbs",
    "systems/railers/templates/apps/actor-tweaks.hbs"
  ]);
};