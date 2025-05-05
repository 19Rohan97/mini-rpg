import React from "react";
import { typeEffectiveness } from "../utils/typeEffectiveness";

export default function PokemonCard({
  poke,
  index,
  isActive,
  isStarter,
  inventory,
  renameIndex,
  newName,
  setNewName,
  setRenameIndex,
  onRename,
  onRelease,
  onMakeActive,
  onUseItem,
}) {
  return (
    <div
      className={`border p-4 rounded bg-gray-50 relative ${
        isActive ? "ring-4 ring-yellow-400" : ""
      }`}
    >
      <img
        src={poke.sprite}
        alt={poke.name}
        className="w-20 h-20 mx-auto object-contain"
      />
      <div className="flex justify-center gap-1 mt-1">
        {poke.type.map((t) => (
          <div className="relative group">
            <img
              key={t}
              src={`/assets/types/${t.toLowerCase()}.png`}
              alt={t}
              className="w-fit"
            />
            <div className="absolute z-10 hidden group-hover:block bg-white text-xs border px-2 py-1 rounded shadow-lg w-44 text-left top-6 left-1/2 transform -translate-x-1/2">
              <p className="font-semibold capitalize">{t}</p>
              <p>
                🟢 Strong vs:{" "}
                {typeEffectiveness[t]?.strongAgainst.join(", ") || "—"}
              </p>
              <p>
                🔴 Weak vs:{" "}
                {typeEffectiveness[t]?.weakAgainst.join(", ") || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-2">
        {renameIndex === index ? (
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
              onClick={() => onRename(index)}
            >
              ✅ Save
            </button>
          </>
        ) : (
          <>
            <p className="font-bold flex items-center gap-1 justify-center capitalize">
              Lv {poke.level} {poke.name}
              <button
                onClick={() => {
                  setRenameIndex(index);
                  setNewName(poke.name);
                }}
                className="text-blue-600 text-sm mt-1"
              >
                ✏️
              </button>
            </p>
            {!isActive && (
              <button
                onClick={() => onMakeActive(index)}
                className="text-indigo-600 text-xs mt-1"
              >
                ✅ Make Active
              </button>
            )}

            {isActive && (
              <span className="text-xs bg-blue-400 text-white px-2 py-1 rounded absolute top-1 left-1">
                🎯 Active
              </span>
            )}
            {isStarter && (
              <span className="text-xs bg-yellow-300 px-2 py-1 rounded absolute top-1 right-1">
                ⭐ Starter
              </span>
            )}

            {/* HP Bar */}
            <div className="w-full bg-red-200 h-2 rounded overflow-hidden mt-1 max-w-[300px] mx-auto">
              <div
                className="bg-green-600 h-full transition-all duration-300"
                style={{
                  width: `${(poke.currentHP / poke.maxHP) * 100}%`,
                }}
              ></div>
            </div>

            {/* XP Bar */}
            <div className="w-full bg-blue-200 h-2 rounded overflow-hidden mt-1 max-w-[300px] mx-auto">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{
                  width: `${(poke.currentXP / (poke.level * 20)) * 100}%`,
                }}
              ></div>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Next level in {Math.max(0, poke.level * 20 - poke.currentXP)} XP
            </p>

            {/* Moves */}
            <div className="text-left mt-2 text-xs max-w-[300px] mx-auto">
              <ul className="list-none grid grid-cols-2 text-center gap-3">
                {poke.moves.map((move, i) => (
                  <li className="bg-amber-100 py-2" key={i}>
                    {move}
                  </li>
                ))}
              </ul>
            </div>

            {/* Usable Items */}
            <div className="mt-2 text-xs text-gray-700 max-w-[350px] mx-auto">
              <ul className="list-none flex flex-wrap justify-center gap-2">
                <li className="flex items-center gap-1">
                  <img
                    src="/assets/items/poke-ball.png"
                    alt="Pokéball"
                    className="w-4 h-4"
                  />
                  Pokéballs: {inventory.pokeball}
                </li>
                <li>
                  <button
                    onClick={() => onUseItem("potion", index)}
                    disabled={
                      inventory.potion <= 0 || poke.currentHP === poke.maxHP
                    }
                    className={`px-2 py-1 rounded text-white text-xs ${
                      inventory.potion <= 0 || poke.currentHP === poke.maxHP
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    🧪 Potion ({inventory.potion})
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onUseItem("superPotion", index)}
                    disabled={
                      inventory.superPotion <= 0 ||
                      poke.currentHP === poke.maxHP
                    }
                    className={`px-2 py-1 rounded text-white text-xs ${
                      inventory.superPotion <= 0 ||
                      poke.currentHP === poke.maxHP
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    🧪 Super Potion ({inventory.superPotion})
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}

        {!isStarter && (
          <button
            onClick={() => onRelease(index)}
            className="text-red-500 text-xs mt-2"
          >
            ❌ Release
          </button>
        )}
      </div>
    </div>
  );
}
