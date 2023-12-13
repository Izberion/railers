export async function onRollDisease(event, html, item, sheet) {
  
    // Roll a 1d8, halved and rounded up, for the number of symptoms
    let symptomRoll = new Roll("1d8");
    symptomRoll.roll();
    let symptomCount = Math.ceil(symptomRoll.result / 2)
    console.log('symptomCount', symptomCount);
    
    // Roll on your symptoms table for each symptom
    let symptoms = [];
    for (let i = 0; i < symptomCount; i++) {
      let symptomTable = game.tables.getName("Symptoms");
      let result = await symptomTable.draw({displayChat: false});
      console.log('draw result', result); // Check the draw result
      
      // Get the actual item from the compendium
      let collection = result.results[0].documentCollection;
      let itemId = result.results[0].documentId;
      console.log(collection, game.packs.get(collection))
      let symptom = await game.packs.get(collection).getDocument(itemId);
      
      // Generate the UUID for the symptom
      let uuid = `Compendium.${collection}.${symptom.id}`;
      console.log('uuid', uuid); // Check the UUID
      
      // Fetch the symptom object from its UUID
      let symptomObject = await fromUuid(uuid);
      
      symptoms.push(symptomObject);      
    }
    
  
    // Roll on your other tables
    let transferTable = game.tables.getName("Transfer");
    let incubationTable = game.tables.getName("Incubation");
    let durationTable = game.tables.getName("Duration");
    let survivabilityTable = game.tables.getName("Survivability");
  
    let transferResult = await transferTable.draw({displayChat: false});
    let incubationResult = await incubationTable.draw({displayChat: false});
    let durationResult = await durationTable.draw({displayChat: false});
    let survivabilityResult = await survivabilityTable.draw({displayChat: false});

    // Set the properties
    item.system.transfer = transferResult.results[0].text;
    item.system.survivability = parseInt(survivabilityResult.results[0].text);
  
    // Handle the Incubation and Duration results
    if (incubationResult.results[0].text === "Immediately") {
      item.system.incubation = "Immediately";
    } else {
      let incubationDice = incubationResult.results[0].text.replace(" Days", "").replace("d", "d8");
      let incubationRoll = new Roll(incubationDice);
      incubationRoll.roll();
      item.system.incubation = incubationRoll.result + " Days";
    }
  
    let durationDice = durationResult.results[0].text.replace(" Days", "").replace(" Weeks", "").replace("d", "d8");
    let durationRoll = new Roll(durationDice);
    durationRoll.roll();
    item.system.duration = durationRoll.result + (durationResult.results[0].text.includes("Weeks") ? " Weeks" : " Days");

    console.log(item);

    const updateData = {
      "system.transfer": transferResult.results[0].text,
      "system.survivability": parseInt(survivabilityResult.results[0].text),
      "system.symptoms": symptoms,
      "system.incubation": item.system.incubation,
      "system.duration": item.system.duration
    };
  
    // Update the item
    await item.update(updateData);

    html.find('.generate-disease').hide();
    html.find('.disease-fields').show();
    await item.setFlag('railers', 'diseaseRolled', true);


    sheet.render();
}
  