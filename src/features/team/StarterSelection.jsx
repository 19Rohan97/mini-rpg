import { useGame } from "../../context/GameContext";
import { useEffect } from "react";
import { starterOptions } from "../../data/starters";
import { createPokemon } from "../../utils/createPokemon";

export default function StarterSelection({ onStarterChosen }) {
  const { team, setTeam, setPlayer, setStarterId } = useGame();

  useEffect(() => {
    if (team.length > 0 && onStarterChosen) onStarterChosen();
  }, [team, onStarterChosen]);

  function chooseStarter(pokemon) {
    const starter = createPokemon(pokemon); // Fix: pass the selected starter data
    starter.id = crypto.randomUUID(); // Assign unique ID
    setStarterId(starter.id); // Save starter ID in context
    setTeam([starter]); // Set as the only team member
    setPlayer((prev) => ({ ...prev, currentHP: 100 })); // Reset player HP
    onStarterChosen(); // Trigger callback
  }

  return (
    <div className="fixed inset-0 bg-white p-6 z-50 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold mb-4">Choose Your Starter Pokémon</h2>
      <div className="flex gap-6 flex-wrap justify-center">
        {starterOptions.map((starter) => (
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
            <p className="mt-2 text-center font-semibold">{starter.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
