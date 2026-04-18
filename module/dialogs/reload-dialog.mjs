// dialogs/reload-dialog.mjs

export async function reloadDialog(actor, item) {
  const weapon = item;
  const magType = weapon.system.magType || null;
  const ammoType = weapon.system.ammoType || null;

  if (weapon.system.isConsumable) {
    ui.notifications.info(game.i18n.localize('RAILERS.dialogs.reload.noReload'));
    return;
  }

  if (!ammoType) {
    ui.notifications.warn(game.i18n.localize('RAILERS.dialogs.reload.noAmmoType'));
    return;
  }

  if (magType === 'internal') {
    await _internalReloadDialog(actor, weapon, ammoType);
  } else {
    await _externalReloadDialog(actor, weapon, ammoType, magType);
  }
}

async function _internalReloadDialog(actor, weapon, ammoType) {
  const currentAmmo = weapon.system.magazine.value;
  const magazineMax = weapon.system.magazine.max;
  const roundsNeeded = magazineMax - currentAmmo;
  const reloadAction = weapon.system.localizedReloadAction;

  if (roundsNeeded <= 0) {
    ui.notifications.info(game.i18n.localize('RAILERS.dialogs.reload.alreadyFull'));
    return;
  }

  const ammoItems = actor.items.filter(i =>
    i.type === 'ammo' &&
    i.system.ammoType === ammoType &&
    i.system.stowage === 'onHand'
  ).sort((a, b) => a.system.roundsRemaining - b.system.roundsRemaining);

  const totalAvailable = ammoItems.reduce((sum, i) => sum + i.system.totalRounds, 0);
  const willLoad = Math.min(roundsNeeded, totalAvailable);

  const content = await foundry.applications.handlebars.renderTemplate(
    'systems/railers/templates/dialog/reload-internal-dialog.hbs',
    {
      weaponName: weapon.name,
      currentAmmo,
      magazineMax,
      roundsNeeded,
      totalAvailable,
      willLoad,
      reloadAction,
      ammoType: game.i18n.localize(CONFIG.RAILERS.ammoTypes[ammoType]),
      canReload: totalAvailable > 0
    }
  );

  await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.format('RAILERS.dialogs.reload.title', { weapon: weapon.name })
    },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: game.i18n.localize('RAILERS.dialogs.reload.confirm'),
      icon: 'fas fa-check',
      callback: async () => {
        if (totalAvailable <= 0) return;
        await _consumeAmmo(actor, weapon, ammoItems, roundsNeeded, magazineMax, currentAmmo);
      }
    },
    cancel: {
      icon: 'fas fa-times',
      label: game.i18n.localize('RAILERS.dialogs.base.cancel'),
      callback: () => {}
    },
    default: 'ok'
  });
}

async function _externalReloadDialog(actor, weapon, ammoType, magType) {
  const currentAmmo = weapon.system.magazine.value;
  const magazineMax = weapon.system.magazine.max;
  const reloadAction = weapon.system.localizedReloadAction;

  const availableMags = actor.items.filter(i => {
    if (i.type !== 'magazine') return false;
    if (i.system.stowage !== 'onHand') return false;
    if (i.system.loadedInWeapon) return false;
    if (i.system.ammo.value <= 0) return false;
    if (i.system.ammoType !== ammoType) return false;

    // Check mag type compatibility
    if (magType === 'belt') return i.system.magType === 'belt';
    if (magType === 'clip') return i.system.magType === 'clip';
    if (magType === 'quiver') return i.system.magType === 'quiver';
    if (magType === 'tank') return i.system.magType === 'tank';
    // external accepts box or drum within capacity
    if (i.system.magType === 'box') return i.system.ammo.max <= magazineMax;
    if (i.system.magType === 'drum') return i.system.ammo.max <= magazineMax * CONFIG.RAILERS.drumMultiplier;
    return false;
  }).sort((a, b) => b.system.ammo.value - a.system.ammo.value);

  const content = await foundry.applications.handlebars.renderTemplate(
    'systems/railers/templates/dialog/reload-external-dialog.hbs',
    {
      weaponName: weapon.name,
      currentAmmo,
      magazineMax,
      reloadAction,
      availableMags,
      canReload: availableMags.length > 0
    }
  );

  await foundry.applications.api.DialogV2.prompt({
    window: {
      title: game.i18n.format('RAILERS.dialogs.reload.title', { weapon: weapon.name })
    },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: game.i18n.localize('RAILERS.dialogs.reload.confirm'),
      icon: 'fas fa-check',
      callback: async (event, button) => {
        if (availableMags.length === 0) return;
        const formData = new FormData(button.form);
        const selectedMagId = formData.get('selectedMag');
        const selectedMag = actor.items.get(selectedMagId);
        if (!selectedMag) return;

        // Eject current mag if there is one
        const oldMagId = weapon.system.loadedMagId;
        if (oldMagId) {
          const oldMag = actor.items.get(oldMagId);
          if (oldMag) {
            await oldMag.update({
              'system.loadedInWeapon': null,
              'system.ammo.value': currentAmmo
            });
          }
        }

        // Load new mag
        await weapon.update({
          'system.magazine.value': selectedMag.system.ammo.value,
          'system.magazine.max': selectedMag.system.ammo.max,
          'system.loadedMagId': selectedMag.id
        });

        await selectedMag.update({
          'system.loadedInWeapon': weapon.name
        });

        ui.notifications.info(game.i18n.format('RAILERS.dialogs.reload.magSwapped', {
          weapon: weapon.name,
          rounds: selectedMag.system.ammo.value
        }));
      }
    },
    cancel: {
      icon: 'fas fa-times',
      label: game.i18n.localize('RAILERS.dialogs.base.cancel'),
      callback: () => {}
    },
    default: 'ok'
  });
}

async function _consumeAmmo(actor, weapon, ammoItems, roundsNeeded, magazineMax, currentAmmo) {
  let remaining = roundsNeeded;
  const updates = [];
  const deletions = [];

  for (const ammoItem of ammoItems) {
    if (remaining <= 0) break;

    const available = ammoItem.system.roundsRemaining;
    const consume = Math.min(remaining, available);
    remaining -= consume;
    const newRoundsRemaining = available - consume;

    if (newRoundsRemaining === 0) {
      if (ammoItem.system.quantity > 1) {
        updates.push({
          _id: ammoItem.id,
          'system.quantity': ammoItem.system.quantity - 1,
          'system.roundsRemaining': CONFIG.RAILERS.ammoCapacity[ammoItem.system.ammoType]
        });
      } else {
        deletions.push(ammoItem.id);
      }
    } else {
      updates.push({
        _id: ammoItem.id,
        'system.roundsRemaining': newRoundsRemaining
      });
    }
  }

  const newMagazineValue = Math.min(magazineMax, currentAmmo + (roundsNeeded - remaining));

  if (updates.length > 0) await actor.updateEmbeddedDocuments('Item', updates);
  if (deletions.length > 0) await actor.deleteEmbeddedDocuments('Item', deletions);
  await weapon.update({ 'system.magazine.value': newMagazineValue });

  if (remaining > 0) {
    ui.notifications.warn(game.i18n.format('RAILERS.dialogs.reload.partialReload', {
      loaded: newMagazineValue,
      max: magazineMax
    }));
  } else {
    ui.notifications.info(game.i18n.format('RAILERS.dialogs.reload.reloadComplete', {
      weapon: weapon.name
    }));
  }
}