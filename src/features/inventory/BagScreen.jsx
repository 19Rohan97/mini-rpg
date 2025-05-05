import { useGame } from "../../context/GameContext";

export default function BagScreen({ onClose }) {
  const { inventory, setInventory, team, setTeam } = useGame();

  function handlePotion(type) {
    const healing = {
      potion: 20,
      superPotion: 50,
    };

    const itemCount = inventory[type];
    if (itemCount <= 0) return alert(`You don't have any ${type}s!`);

    const indexToHeal = team.findIndex((p) => p.currentHP < p.maxHP);
    if (indexToHeal === -1) return alert("All Pokémon are fully healed!");

    const updatedTeam = [...team];
    const poke = updatedTeam[indexToHeal];

    poke.currentHP = Math.min(poke.currentHP + healing[type], poke.maxHP);
    setTeam(updatedTeam);

    // Decrease item count
    setInventory((prev) => ({
      ...prev,
      [type]: prev[type] - 1,
    }));

    localStorage.setItem("pokemon-inventory", JSON.stringify(inventory));
    alert(`${poke.name} was healed with a ${type}!`);
  }

  return (
    <div className="fixed inset-0 z-50 bg-white p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">🎒 Your Bag</h2>
      <div className="grid gap-4 text-center">
        <div>
          <p>🔴 Pokéballs: {inventory.pokeball}</p>
        </div>
        <div>
          <p>🧪 Potions: {inventory.potion}</p>
          <button
            onClick={() => handlePotion("potion")}
            className="mt-2 px-4 py-1 bg-green-600 text-white rounded"
          >
            Use Potion
          </button>
        </div>
        <div>
          <p>🧪 Super Potions: {inventory.superPotion}</p>
          <button
            onClick={() => handlePotion("superPotion")}
            className="mt-2 px-4 py-1 bg-green-700 text-white rounded"
          >
            Use Super Potion
          </button>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-6 block mx-auto px-6 py-2 bg-gray-600 text-white rounded"
      >
        Close
      </button>
    </div>
  );
}
