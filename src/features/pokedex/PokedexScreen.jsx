import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { fetchPokedexEntry } from "../../utils/fetchPokedexEntry";

export default function PokedexScreen({ onClose }) {
  const { team } = useGame();
  const [allPokemon, setAllPokemon] = useState([]);
  const [entries, setEntries] = useState({});

  // List of caught names (e.g., ["Charmander", "Pidgey"])
  const caughtNames = team.map((p) => p.name.toLowerCase());

  // Fetch first 151 Pokémon
  useEffect(() => {
    async function loadAllPokemon() {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const data = await res.json();
      setAllPokemon(data.results); // Array of { name, url }
    }

    loadAllPokemon();
  }, []);

  // Fetch flavor texts for caught ones
  useEffect(() => {
    async function loadEntries() {
      const newEntries = {};
      for (const name of caughtNames) {
        if (!entries[name]) {
          const entry = await fetchPokedexEntry(name);
          newEntries[name] = entry;
        }
      }
      setEntries((prev) => ({ ...prev, ...newEntries }));
    }

    loadEntries();
  }, [caughtNames]);

  return (
    <div className="fixed inset-0 bg-white p-6 z-50 overflow-y-auto">
      <div className="flex items-center mb-5 justify-between w-full">
        <h2 className="text-2xl font-bold text-center ">📘 Pokédex</h2>
        <button
          onClick={onClose}
          className=" px-6 py-2 bg-gray-700 text-white rounded block"
        >
          Close Pokédex
        </button>
      </div>

      {allPokemon.length === 0 ? (
        <p className="text-center text-gray-500">Loading Pokédex...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allPokemon.map((poke, index) => {
            const name = poke.name;
            const isCaught = caughtNames.includes(name);
            const displayName = isCaught
              ? name.charAt(0).toUpperCase() + name.slice(1)
              : "???";
            const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
              index + 1
            }.png`;

            return (
              <div
                key={name}
                className={`border rounded p-4 bg-gray-50 flex flex-col items-center shadow ${
                  isCaught ? "" : "opacity-40 grayscale"
                }`}
              >
                <img
                  src={sprite}
                  alt={name}
                  className="w-20 h-20 mb-2 object-contain"
                />
                <h3 className="font-bold capitalize">{displayName}</h3>
                {isCaught && entries[name] && (
                  <p className="text-xs mt-1 italic text-center max-w-xs text-gray-600">
                    {entries[name]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-6 px-6 py-2 bg-gray-700 text-white rounded block mx-auto"
      >
        Close Pokédex
      </button>
    </div>
  );
}
