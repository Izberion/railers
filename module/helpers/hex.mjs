let hexes = {
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


export async function handleHexClick(event, html, actor) {
    const hexesElements = html.find('.hex');
    let hexStates = [];
    let coordinates, roll, index;
    
    // Mapping of image file names
    const terrainTypes = {
    'snowhex.svg': game.i18n.localize("RAILERS.SnowTerrain"),
    'hillhex.svg': game.i18n.localize("RAILERS.HillTerrain"),
    'icehex.svg': game.i18n.localize("RAILERS.IceTerrain"),
    'flathex.svg': game.i18n.localize("RAILERS.FlatTerrain"),
    'mountainhex.svg': game.i18n.localize("RAILERS.MountainTerrain")
    };
    const weatherTypes = {
    'aurorahex.svg': game.i18n.localize("RAILERS.Aurora"),
    'blizzardhex.svg': game.i18n.localize("RAILERS.Blizzard"),
    'clearhex.svg': game.i18n.localize("RAILERS.Clear"),
    'diamonddusthex.svg': game.i18n.localize("RAILERS.DiamondDust"),
    'flurryhex.svg': game.i18n.localize("RAILERS.Flurry"),
    'icefoghex.svg': game.i18n.localize("RAILERS.IceFog"),
    'overcasthex.svg': game.i18n.localize("RAILERS.Overcast"),
    'polaroutbreakhex.svg': game.i18n.localize("RAILERS.PolarOutbreak"),
    'snowstormhex.svg': game.i18n.localize("RAILERS.SnowStorm"),
    'thundersnowhex.svg': game.i18n.localize("RAILERS.ThunderSnow"),
    'whiteouthex.svg': game.i18n.localize("RAILERS.Whiteout"),
    'windhex.svg': game.i18n.localize("RAILERS.Wind")
    };

    let systemIntegrate = html.find('input[name="system.integrate"]').prop('checked');

    if ($(event.currentTarget).hasClass('d12hex')) {
        // Roll a d12
        roll = await new Roll('1d12').roll();

        // Get the default roll result HTML
        const rollResultHTML = await roll.render();

        // Get the coordinates of the active hex
        coordinates = hexesElements.filter('.active').data('coordinates');

        // Get the image src of the active hex
        const imgSrc = html.find(`.hex[data-coordinates="${coordinates}"]`).find('img').attr('src');

        // Extract the file name from the src
        const fileName = imgSrc.split('/').pop();

        // Get the terrain type based on the file name
        const terrainType = terrainTypes[fileName];

        const weatherType = weatherTypes[fileName];
        
        let tableResultText = '';
        if (systemIntegrate && actor.type === "weather") {
            // Roll on the season table
            let season = html.find('input[name="system.season"]:checked').val();
            let tableName;
            if (season === 'winter') {
            tableName = 'Winter Temperature';
            } else if (season === 'summer') {
            tableName = 'Summer Temperature';
            }
            let rollTable = game.tables.contents.find(t => t.name === tableName);
            let tableResult = await rollTable.roll();

            // Get the table result
            tableResultText = tableResult.results[0].text;
        }
        
        // If the roll is even, calculate the new active hex and its terrain
        if (roll.total % 2 === 0) {
            // Calculate the index of the new active hex based on the roll
            index = Math.floor(roll.total / 2) - 1;

            // Get the adjacent hexes
            let adjacentHexes = hexes[coordinates];

            // Make sure the index is within the bounds of the array
            if (index < 0 || index >= adjacentHexes.length) return;

            // Get the coordinates of the new active hex
            let newCoordinates = adjacentHexes[index];

            // Find the new active hex
            let newActiveHex = html.find(`.hex[data-coordinates="${newCoordinates}"]`);

            // Get the image src of the new active hex
            const newImgSrc = newActiveHex.find('img').attr('src');

            // Extract the file name from the src
            const newFileName = newImgSrc.split('/').pop();

            // Get the terrain type based on the file name
            const newTerrainType = terrainTypes[newFileName];

            const newWeatherType = weatherTypes[newFileName];

            // Output the roll and the new terrain type to the chat
            roll.toMessage({
            flavor: game.i18n.localize(actor.type === 'terrain' ? "RAILERS.RollTerrainFlower" : "RAILERS.RollWeatherFlower"),
            content: `<div class="dice-results">${actor.type === 'terrain' ? newTerrainType : newWeatherType}</div>${systemIntegrate ? `<div class="dice-results">${tableResultText}</div>` : ""}`,
            speaker: ChatMessage.getSpeaker({ actor: actor })
            });

            // Make all hexes inactive
            hexesElements.removeClass('active').addClass('inactive');
            hexStates = hexesElements.map(() => 'inactive').toArray()

            // Make the new hex active
            newActiveHex.removeClass('inactive').addClass('active');

            // Record the state of the new active hex
            hexStates[hexesElements.index(newActiveHex)] = 'active'; 
        } else {
            // If the roll is odd, output the roll and the current terrain type to the chat
            roll.toMessage({
            flavor: game.i18n.localize(actor.type === 'terrain' ? "RAILERS.RollTerrainFlower" : "RAILERS.RollWeatherFlower"),
            content: `<div class="dice-results">${actor.type === 'terrain' ? terrainType : weatherType}</div>${systemIntegrate ? `<div class="dice-results">${tableResultText}</div>` : ""}`,
            speaker: ChatMessage.getSpeaker({ actor: actor })
            })
            return;
        }
    } else {
    // Handle manual hex selection
    hexesElements.each((i, h) => {
        h.classList.remove('active');
        h.classList.add('inactive');
        hexStates.push('inactive'); // Record the state of each hex
    });
    event.currentTarget.classList.remove('inactive');
    event.currentTarget.classList.add('active');
    hexStates[hexesElements.index(event.currentTarget)] = 'active'; // Record the state of the clicked hex
    }

    // Store the hex states in the actor's flags
    actor.setFlag('railers', 'hexStates', hexStates);
}

export function retrieveHexStates(actor, html) {

    // After the listeners are activated, retrieve the hex states from the actor's flags
    let hexStates = actor.getFlag('railers', 'hexStates');
    
    const hexes = html.find('.hex');
    
    // If no hexStates exist, set the default center hex as active
    if (!hexStates) {
      hexStates = Array(hexes.length).fill('inactive'); // Initialize all hexes as inactive
  
      // Set the center hex (2,3) as active
      const centerHexIndex = hexes.index(html.find('.hex[data-coordinates="(2,2)"]'));
      hexStates[centerHexIndex] = 'active';
  
      // Apply the active state to the center hex
      hexes.each((i, h) => {
        h.classList.remove('active', 'inactive');
        h.classList.add(hexStates[i]);
      });
  
      // Store the initial state in the actor's flags
      actor.setFlag('railers', 'hexStates', hexStates);
    } else {
      // If hex states exist, apply them to the corresponding hex
      hexes.each((i, h) => {
        h.classList.remove('active', 'inactive');
        h.classList.add(hexStates[i]);
      });
    }
  }
  
  