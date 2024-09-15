export async function addWoundDialog(actor, html) {
    const content = await renderTemplate("systems/railers/templates/dialog/wound-dialog.html");
    const dialogReturn = await Dialog.wait({
      title: game.i18n.localize("RAILERS.AddWound"),
      content,
      buttons: {
        ok: {
          label: game.i18n.localize("RAILERS.Add"),
          callback: async (html) => {
            const damage = parseInt(html.find('input[name="wound-damage"]').val(), 10) || 0;
            const severity = parseInt(html.find('input[name="wound-severity"]').val(), 10) || 0;
            const name = html.find('input[name="wound-name"]').val() || "Wound";

            const woundData = {
              name,
              type: "wound",
              system: {
                damage,
                severity
              },
            };

            const wounds = await actor.createEmbeddedDocuments("Item", [woundData]);

          }
        },
        cancel: {
          label: game.i18n.localize("RAILERS.Cancel"),
        },
      },
      default: "ok",
    });
  }
