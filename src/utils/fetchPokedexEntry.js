export async function fetchPokedexEntry(nameOrId) {
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${nameOrId}`
    );
    const data = await res.json();

    const entry = data.flavor_text_entries.find(
      (entry) => entry.language.name === "en"
    );

    return entry ? entry.flavor_text.replace(/\f|\n/g, " ") : "No entry found.";
  } catch (err) {
    console.error("Error fetching Pokédex entry:", err);
    return "No entry available.";
  }
}
