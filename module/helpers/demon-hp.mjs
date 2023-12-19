export async function onRollHp(event, actor) {
    event.preventDefault();
    if(actor.type === 'demon') {
      let endurance = Number(actor.system.attributes.endurance);
      let roll = await new Roll(`${endurance}d8`).roll();  
      actor.update({'system.hitpoints.max': roll.result});     
    }
}
  