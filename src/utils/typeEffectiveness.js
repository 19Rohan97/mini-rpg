// Basic type effectiveness chart
export const typeEffectiveness = {
  fire: { strongAgainst: ["grass"], weakAgainst: ["water", "rock"] },
  water: {
    strongAgainst: ["fire", "rock"],
    weakAgainst: ["electric", "grass"],
  },
  grass: { strongAgainst: ["water", "rock"], weakAgainst: ["fire", "bug"] },
  electric: { strongAgainst: ["water", "flying"], weakAgainst: ["ground"] },
  // Add more as needed
};
