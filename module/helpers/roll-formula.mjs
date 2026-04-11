/**
 * Builds the dice roll formula for Railers' dice pool system.
 * - Negative pool: automatic failure, returns null
 * - Zero pool: penalty roll, keep lowest of 2d8
 * - Positive pool: standard pool of d8s
 * 
 * @param {number} poolTotal - The total number of dice in the pool
 * @param {number} tn - The target number for success (4-8)
 * @returns {string|null} The roll formula, or null for automatic failure
 */
export function buildRollFormula(poolTotal, tn) {
  if (poolTotal < 0) return null;
  if (poolTotal === 0) return `2d8kl1x8cs>=${tn}df=1`;
  return `${poolTotal}d8x8cs>=${tn}df=1`;
}