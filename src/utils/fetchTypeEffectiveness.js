const TYPE_API_BASE = "https://pokeapi.co/api/v2/type/";

const typeCache = {};

export async function fetchTypeEffectiveness(typeName) {
  if (typeCache[typeName]) return typeCache[typeName];

  try {
    const response = await fetch(`${TYPE_API_BASE}${typeName}`);
    const data = await response.json();

    const relations = data.damage_relations;

    const effectiveness = {
      strongAgainst: relations.double_damage_to.map((t) => t.name),
      weakAgainst: relations.double_damage_from.map((t) => t.name),
      resistantTo: relations.half_damage_from.map((t) => t.name),
      noDamageFrom: relations.no_damage_from.map((t) => t.name),
    };

    typeCache[typeName] = effectiveness;
    return effectiveness;
  } catch (error) {
    console.error("Failed to fetch type data:", error);
    return null;
  }
}
