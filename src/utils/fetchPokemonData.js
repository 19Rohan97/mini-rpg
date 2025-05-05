export async function fetchPokemonData(idOrName, level = 5) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    const data = await res.json();

    // 1. Filter moves learned by level-up (Gen 1 or latest version group)
    const levelUpMoves = data.moves
      .map((entry) => {
        const levelInfo = entry.version_group_details.find(
          (d) =>
            d.move_learn_method.name === "level-up" &&
            d.version_group.name === "red-blue" // or "scarlet-violet" etc.
        );
        return levelInfo
          ? {
              name: entry.move.name,
              level: levelInfo.level_learned_at,
            }
          : null;
      })
      .filter(Boolean)
      .filter((move) => move.level <= level)
      .sort((a, b) => b.level - a.level) // Highest first
      .slice(0, 4); // Pick latest 4

    return {
      name: data.name,
      sprite: data.sprites.front_default,
      maxHP: 40 + (level - 1) * 10,
      currentHP: 40 + (level - 1) * 10,
      level,
      type: data.types.map((t) => t.type.name),
      moves: levelUpMoves.length
        ? await Promise.all(
            levelUpMoves.map(async (m) => {
              const moveRes = await fetch(
                `https://pokeapi.co/api/v2/move/${m.name}`
              );
              const moveData = await moveRes.json();
              return {
                name: capitalize(m.name),
                type: moveData.type.name,
              };
            })
          )
        : [{ name: "Tackle", type: "normal" }],
    };
  } catch (err) {
    console.error("Failed to fetch Pokémon:", err);
    return null;
  }
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
}
