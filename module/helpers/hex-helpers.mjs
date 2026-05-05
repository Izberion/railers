export function getOrInitHexStates(settingKey) {
  const stored = game.settings.get("railers", settingKey);
  if (!stored || stored.length !== 19) {
    const states = Array(19).fill("inactive");
    states[9] = "active";
    return states;
  }
  return stored;
}