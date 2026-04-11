export async function locomotiveChange(actor, selectedType) {
  const stats = CONFIG.RAILERS.locomotiveStats[selectedType];
  if (!stats) return;

  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: {
      title: game.i18n.localize("RAILERS.dialogs.base.warning")
    },
    content: game.i18n.localize("RAILERS.dialogs.train.changeLocomotiveWarning"),
    rejectClose: false,
    defaultButton: "no",
  });

  if (!confirmed) return;

  await actor.update({
    'system.locomotive': selectedType,
    'system.speed': stats.speed,
    'system.fuel.max': stats.fuel,
    'system.armor': stats.armor,
    'system.power.max': stats.power,
    'system.weight.max': stats.weight,
    'system.capacity': stats.capacity,
  });
}