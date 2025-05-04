import { useGame } from "../../context/GameContext";
import { useState } from "react";

export default function TeamManagementScreen() {
  const { team, setTeam, starterId } = useGame();
  const [renameIndex, setRenameIndex] = useState(null);
  const [newName, setNewName] = useState("");

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
      const updatedTeam = team.filter((_, i) => i !== index);
      setTeam(updatedTeam);
    }
  };

  const handleHeal = () => {
    const healedTeam = team.map((poke) => ({
      ...poke,
      currentHP: poke.maxHP,
    }));
    setTeam(healedTeam);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow rounded fixed w-full h-full top-0 left-0 z-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Pokémon Team</h2>

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
            <div key={idx} className="border p-4 rounded bg-gray-50 relative">
              <img
                src={poke.sprite}
                alt={poke.name}
                className="w-20 h-20 mx-auto object-contain"
              />
              <div className="flex justify-center gap-1 mt-1">
                {poke.type.map((t) => (
                  <img
                    key={t}
                    src={`/assets/types/${t.toLowerCase()}.png`}
                    alt={t}
                    className="w-fit"
                    title={t}
                  />
                ))}
              </div>
              <div className="text-center mt-2">
                {renameIndex === idx ? (
                  <>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="border p-1 rounded w-full text-center"
                      placeholder="New name"
                    />
                    <button
                      className="text-blue-600 text-sm mt-1 block"
                      onClick={() => handleRename(idx)}
                    >
                      ✅ Save
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-bold">{poke.name}</p>
                    {poke.id === starterId && (
                      <span className="text-xs bg-yellow-300 px-2 py-1 rounded absolute top-1 right-1">
                        ⭐ Starter
                      </span>
                    )}
                    <p className="text-xs text-gray-600">
                      Lv {poke.level} — HP: {poke.currentHP}/{poke.maxHP}
                    </p>
                    <p className="text-xs text-gray-600">
                      XP: {poke.currentXP}/{poke.level * 20}
                    </p>
                    <button
                      onClick={() => {
                        setRenameIndex(idx);
                        setNewName(poke.name);
                      }}
                      className="text-blue-600 text-sm mt-1"
                    >
                      ✏️ Rename
                    </button>
                  </>
                )}
                {poke.id !== starterId && (
                  <button
                    onClick={() => handleRelease(idx)}
                    className="text-red-500 text-xs mt-2"
                  >
                    ❌ Release
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
