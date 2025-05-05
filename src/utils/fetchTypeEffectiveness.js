const TYPE_API_BASE = "https://pokeapi.co/api/v2/type/";

const typeCache = {};

// Load from localStorage on first run
const localCache = JSON.parse(
  localStorage.getItem("typeEffectivenessCache") || "{}"
);
Object.assign(typeCache, localCache);

export async function fetchTypeEffectiveness(typeName) {
  typeName = typeName.toLowerCase();
  if (typeCache[typeName]) return typeCache[typeName];

  try {
    const response = await fetch(`${TYPE_API_BASE}${typeName}`);
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();

    const relations = data.damage_relations;

    const effectiveness = {
      double_damage_to: relations.double_damage_to.map((t) => t.name),
      half_damage_to: relations.half_damage_to.map((t) => t.name),
      no_damage_to: relations.no_damage_to.map((t) => t.name),

      double_damage_from: relations.double_damage_from.map((t) => t.name),
      half_damage_from: relations.half_damage_from.map((t) => t.name),
      no_damage_from: relations.no_damage_from.map((t) => t.name),
    };

    typeCache[typeName] = effectiveness;
    localStorage.setItem("typeEffectivenessCache", JSON.stringify(typeCache));

    return effectiveness;
  } catch (error) {
    console.error(`Failed to fetch type effectiveness for ${typeName}:`, error);
    return {
      double_damage_to: [],
      half_damage_to: [],
      no_damage_to: [],
      double_damage_from: [],
      half_damage_from: [],
      no_damage_from: [],
    };
  }
}

export async function preloadAllTypes() {
  const allTypes = [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy",
  ];

  for (const type of allTypes) {
    if (!typeCache[type]) {
      await fetchTypeEffectiveness(type);
    }
  }

  console.log("✅ All type effectiveness data preloaded.");
}
