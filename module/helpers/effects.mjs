/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export function onManageActiveEffect(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest("li");
  const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
  let name = "New Effect";
  let duration = undefined;

  switch (li.dataset.effectType) {
    case "condition":
      name = "New Condition";
      break;
    case "mutation":
      name = "New Mutation";
      break;
    case "disease":
      name = "New Disease";
      duration = {quarters: 1};
      break;
  }

  switch ( a.dataset.action ) {
    case "create":
      return owner.createEmbeddedDocuments("ActiveEffect", [{
        name: name,
        icon: "icons/svg/aura.svg",
        origin: owner.uuid,
        duration: duration,
        flags: { effectType: li.dataset.effectType }
      }]);
    case "edit":
      if (effect) return effect.sheet.render(true);
      break;
    case "delete":
      if (effect) return effect.delete();
      break;
  }
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects) {

    // Define effect header categories
    const categories = {
      condition: {
        type: "condition",
        label: "Conditions",
        effects: []
      },
      mutation: {
        type: "mutation",
        label: "Mutations",
        effects: []
      },
      disease: {
        type: "disease",
        label: "Diseases",
        effects: []
      }
    };

    // Iterate over active effects, classifying them into categories
    for ( let e of effects ) {
      if ( e.flags && e.flags.effectType ) {
        let effectType = e.flags.effectType;
        if ( categories[effectType] ) {
          categories[effectType].effects.push(e);
        }
      }
    }
    return categories;
}
