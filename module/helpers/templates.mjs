/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/railers/templates/actor/parts/actor-skills.html",
    "systems/railers/templates/actor/parts/actor-gear.html",
    "systems/railers/templates/actor/parts/actor-wounds.html",
    "systems/railers/templates/actor/parts/actor-effects.html",
    "systems/railers/templates/actor/parts/actor-bio.html",
    "systems/railers/templates/actor/parts/actor-cars.html",
    "systems/railers/templates/actor/parts/actor-cargo.html",
    "systems/railers/templates/actor/parts/actor-notes.html"
  ]);
};
