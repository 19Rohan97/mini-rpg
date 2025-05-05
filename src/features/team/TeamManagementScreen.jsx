import { useGame } from "../../context/GameContext";
import { useState } from "react";
import PokemonCard from "../../components/PokemonCard";

export default function TeamManagementScreen() {
  const {
    team,
    setTeam,
    starterId,
    inventory,
    setInventory,
    activePokemonIndex,
    setActivePokemonIndex,
  } = useGame();

  const [renameIndex, setRenameIndex] = useState(null);
  const [newName, setNewName] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const allHealed = team.every((p) => p.currentHP === p.maxHP);

  const handleRename = (index) => {
    const updatedTeam = [...team];
    updatedTeam[index].name = newName;
    setTeam(updatedTeam);
    setRenameIndex(null);
    setNewName("");
  };

  const handleRelease = (index) => {
    if (
      window.confirm(`Are you sure you want to release ${team[index].name}?`)
    ) {
      const releasedName = team[index].name;
      const updatedTeam = team.filter((_, i) => i !== index);
      setTeam(updatedTeam);

      if (index === activePokemonIndex) {
        const newStarterIndex = updatedTeam.findIndex(
          (p) => p.id === starterId
        );
        const fallbackIndex = newStarterIndex >= 0 ? newStarterIndex : 0;
        setActivePokemonIndex(fallbackIndex);

        const fallbackName = updatedTeam[fallbackIndex]?.name;
        if (fallbackName) {
          setToastMessage(
            `${releasedName} was released. ${fallbackName} is now Active!`
          );
          setTimeout(() => setToastMessage(""), 2000);
        }
      } else if (index < activePokemonIndex) {
        setActivePokemonIndex((prev) => prev - 1);
      }
    }
  };

  const handleHeal = () => {
    const healedTeam = team.map((poke) => ({
      ...poke,
      currentHP: poke.maxHP,
    }));
    setTeam(healedTeam);
  };

  const handleUseItem = (type, index) => {
    const healing = {
      potion: 20,
      superPotion: 50,
    };

    if (inventory[type] <= 0) return;
    const updatedTeam = [...team];
    const poke = updatedTeam[index];

    if (poke.currentHP === poke.maxHP) return;

    poke.currentHP = Math.min(poke.currentHP + healing[type], poke.maxHP);
    setTeam(updatedTeam);

    setInventory((prev) => ({
      ...prev,
      [type]: prev[type] - 1,
    }));

    setToastMessage(
      `${poke.name} healed with ${
        type === "potion" ? "Potion" : "Super Potion"
      }!`
    );
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleMakeActive = (index) => {
    if (index !== activePokemonIndex) {
      setActivePokemonIndex(index);
      setToastMessage(`${team[index].name} is now Active!`);
      setTimeout(() => setToastMessage(""), 2000);
    }
  };

  return (
    <div className="mx-auto p-6 bg-white shadow rounded fixed w-full h-full top-0 left-0 z-10 pt-24 md:pt-14">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Pokémon Team</h2>

      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          {toastMessage}
        </div>
      )}

      {team.length > 0 && (
        <div className="text-center mb-4">
          <button
            onClick={handleHeal}
            disabled={allHealed}
            className={`px-4 py-2 rounded text-white ${
              allHealed
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            🧪 Heal All Pokémon
          </button>
        </div>
      )}

      {team.length === 0 ? (
        <p className="text-center text-gray-500">Your team is empty.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {team.map((poke, idx) => (
            <PokemonCard
              key={idx}
              poke={poke}
              index={idx}
              isActive={idx === activePokemonIndex}
              isStarter={poke.id === starterId}
              inventory={inventory}
              renameIndex={renameIndex}
              newName={newName}
              setNewName={setNewName}
              setRenameIndex={setRenameIndex}
              onRename={handleRename}
              onRelease={handleRelease}
              onMakeActive={handleMakeActive}
              onUseItem={handleUseItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
