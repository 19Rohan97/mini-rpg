export async function fetchPokemonData(nameOrId) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
    const data = await res.json();

    const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    const sprite = data.sprites.front_default;
    const type = data.types.map((t) => t.type.name);
    const baseHP = data.stats.find((s) => s.stat.name === "hp").base_stat;
    const moves = data.moves
      .slice(0, 4)
      .map((m) => m.move.name.replace("-", " "))
      .map((move) => move.charAt(0).toUpperCase() + move.slice(1));

    return {
      name,
      type,
      maxHP: baseHP,
      sprite,
      moves,
    };
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    return null;
  }
}
