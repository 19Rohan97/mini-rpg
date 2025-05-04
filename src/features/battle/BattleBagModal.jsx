import { useGame } from "../../context/GameContext";

export default function BattleBagModal({ onClose }) {
  const { inventory, setInventory, team, setTeam, activePokemonIndex } =
    useGame();
  const activePokemon = team[activePokemonIndex];

  const healOptions = {
    potion: 20,
    superPotion: 50,
  };

  function handleItem(type) {
    if (inventory[type] <= 0) {
      alert(`You don't have any ${type}s!`);
      return;
    }

    if (activePokemon.currentHP === activePokemon.maxHP) {
      alert(`${activePokemon.name} is already at full HP!`);
      return;
    }

    const healedAmount = Math.min(
      healOptions[type],
      activePokemon.maxHP - activePokemon.currentHP
    );

    const updatedTeam = [...team];
    updatedTeam[activePokemonIndex] = {
      ...activePokemon,
      currentHP: activePokemon.currentHP + healedAmount,
    };

    setTeam(updatedTeam);
    setInventory((prev) => ({
      ...prev,
      [type]: prev[type] - 1,
    }));

    alert(`${activePokemon.name} healed ${healedAmount} HP using ${type}.`);
    onClose(); // close the bag after use
  }

  return (
    <div className="fixed inset-0 bg-white z-50 p-6 text-center">
      <h2 className="text-xl font-bold mb-4">🎒 Bag</h2>
      <p className="mb-2">
        {activePokemon.name}: {activePokemon.currentHP}/{activePokemon.maxHP} HP
      </p>
      <div className="space-y-4">
        <div>
          <p>🧪 Potion: {inventory.potion}</p>
          <button
            onClick={() => handleItem("potion")}
            className="mt-1 px-4 py-2 bg-green-600 text-white rounded"
          >
            Use Potion (+20 HP)
          </button>
        </div>
        <div>
          <p>🧪 Super Potion: {inventory.superPotion}</p>
          <button
            onClick={() => handleItem("superPotion")}
            className="mt-1 px-4 py-2 bg-green-700 text-white rounded"
          >
            Use Super Potion (+50 HP)
          </button>
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-6 px-6 py-2 bg-gray-500 text-white rounded"
      >
        Close
      </button>
    </div>
  );
}
