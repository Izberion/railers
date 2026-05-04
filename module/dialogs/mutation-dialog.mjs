export async function rollMutationsDialog(actor) {
  const compendium = game.packs.get("railers.tables");
  const tableEntry = compendium.index.find(t => t.name === "Mutations");
  if (!tableEntry) {
    ui.notifications.warn("Mutations table not found in compendium.");
    return;
  }
  const table = await compendium.getDocument(tableEntry._id);
  if (!table) return;

  const roll = await table.roll({ messageMode: game.settings.get("core", "messageMode") });
  const result = roll.results[0];
  if (!result) {
    ui.notifications.warn("No result returned from Mutations table.");
    return;
  }

  const mutationDoc = await fromUuid(result.uuid);
  if (!mutationDoc) {
    ui.notifications.warn("Could not find mutation in compendium.");
    return;
  }

  const tableResult = await fromUuid(result.uuid);
  if (!tableResult) {
    ui.notifications.warn("Could not find mutation in compendium.");
    return;
  }

  const mutation = await fromUuid(tableResult.documentUuid);
  if (!mutation) {
    ui.notifications.warn("Could not load full mutation document.");
    return;
  }

  const content = await foundry.applications.handlebars.renderTemplate(
    "systems/railers/templates/dialog/mutation-dialog.hbs",
    {
      img: mutation.img,
      name: mutation.name,
      description: mutation.system.description ?? ""
    }
  );

  await roll.roll.toMessage({
    user: game.user.id,
    speaker: { actor: actor, alias: actor.name },
    flavor: game.i18n.localize("RAILERS.dialogs.mutation.title"),
    content: `
      <div class="mutation-chat">
        <div class="mutation-chat-header">
          <strong>${mutation.name}</strong>
        </div>
        ${mutation.system.description}
      </div>
    `
  });

  const confirmed = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.localize("RAILERS.dialogs.mutation.title") },
    content,
    rejectClose: false,
    ok: {
      label: game.i18n.localize("RAILERS.dialogs.mutation.add"),
      icon: "fas fa-plus",
      callback: () => true
    }
  });

  if (confirmed) {
    await actor.createEmbeddedDocuments("Item", [mutation.toObject()]);
    ui.notifications.info(`${mutation.name} added to ${actor.name}.`);
  }
}