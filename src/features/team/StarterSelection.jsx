import { useGame } from "../../context/GameContext";
import { useEffect, useState } from "react";
import { createPokemon } from "../../utils/createPokemon";
import { fetchPokemonData } from "../../utils/fetchPokemonData";

const starterNames = ["charmander", "squirtle", "bulbasaur"];

export default function StarterSelection({ onStarterChosen }) {
  const { team, setTeam, setPlayer, setStarterId } = useGame();
  const [starters, setStarters] = useState([]);

  function chooseStarter(pokemon) {
    const starter = createPokemon({ ...pokemon, level: 5 });
    setStarterId(starter.id);
    setTeam([starter]);
    setPlayer((prev) => ({ ...prev, currentHP: 100 }));
    onStarterChosen();
  }

  useEffect(() => {
    async function loadStarters() {
      const results = await Promise.all(
        starterNames.map((name) => fetchPokemonData(name, 5))
      );
      setStarters(results.filter(Boolean));
    }

    loadStarters();
  }, []);

  useEffect(() => {
    if (team.length > 0 && onStarterChosen) onStarterChosen();
  }, [team, onStarterChosen]);

  if (starters.length === 0) return <p>Loading starters...</p>;

  return (
    <div className="fixed inset-0 bg-white p-6 z-50 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Choose Your Starter Pokémon</h2>
      <div className="flex gap-6 flex-wrap justify-center">
        {starters.map((starter) => (
          <button
            key={starter.name}
            className="border p-4 rounded shadow hover:bg-gray-100 cursor-pointer"
            onClick={() => chooseStarter(starter)}
          >
            <img
              src={starter.sprite}
              alt={starter.name}
              className="w-28 h-28 mx-auto"
            />
            <p className="mt-2 text-center font-semibold">
              {starter.name.charAt(0).toUpperCase() + starter.name.slice(1)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
