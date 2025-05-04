import { useGame } from "../../context/GameContext";
import { useEffect, useState } from "react";
import HPBar from "../../components/HPBar";
import XPBar from "../../components/XPBar";
import { createPokemon } from "../../utils/createPokemon";
import BattleBagModal from "./BattleBagModal";

export default function BattleScreen() {
  const {
    battle,
    setBattle,
    team,
    setTeam,
    inventory,
    setInventory,
    activePokemonIndex,
    setActivePokemonIndex,
  } = useGame();
  const enemy = battle.enemy;

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showMessage, setShowMessage] = useState("");
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showCatchPrompt, setShowCatchPrompt] = useState(false);
  const [showBag, setShowBag] = useState(false);

  function handleAttack(move) {
    if (!isPlayerTurn || !enemy || battle.turn !== "player") return;

    const damage = Math.floor(Math.random() * 10) + 5;
    const newHP = Math.max(enemy.currentHP - damage, 0);

    // setShowMessage(`${playerPokemon.name} used ${move}!`);

    setShowMessage(`${team[activePokemonIndex].name} used ${move}!`);

    setTimeout(() => {
      if (newHP <= 0) {
        const xpGained = 15 + Math.floor(Math.random() * 10);
        setShowMessage(`${enemy.name} fainted! Gained ${xpGained} XP!`);

        setTimeout(() => {
          const updatedPokemon = { ...team[activePokemonIndex] };
          updatedPokemon.currentXP += xpGained;

          const xpNeeded = updatedPokemon.level * 20;

          if (updatedPokemon.currentXP >= xpNeeded) {
            updatedPokemon.level += 1;
            updatedPokemon.maxHP += 10;
            updatedPokemon.currentHP = updatedPokemon.maxHP;
            updatedPokemon.currentXP -= xpNeeded;

            setShowMessage(
              `${updatedPokemon.name} leveled up to ${updatedPokemon.level}!`
            );
          }

          const newTeam = [...team];
          newTeam[activePokemonIndex] = updatedPokemon;
          setTeam(newTeam);

          setTimeout(() => {
            setBattle({ ...battle, inBattle: false, enemy: null });
            setActivePokemonIndex(0);
            setShowMessage("");
          }, 1500);
        }, 1000);
      } else {
        // Continue battle
        setBattle((prev) => ({
          ...prev,
          enemy: { ...enemy, currentHP: newHP },
          turn: "enemy",
        }));
        setIsPlayerTurn(false);
      }
    }, 1000);
  }

  function handleCatch() {
    if (!enemy || !battle.inBattle) return;

    // Check Pokéball count
    if (inventory.pokeball <= 0) {
      setShowMessage("You're out of Pokéballs!");
      return;
    }

    // Reduce Pokéball count
    setInventory((prev) => ({
      ...prev,
      pokeball: prev.pokeball - 1,
    }));

    const catchRate = Math.max(0.2, 1 - enemy.currentHP / enemy.maxHP); // more likely if HP is low

    setShowMessage("Throwing Pokéball...");

    setTimeout(() => {
      const caught = Math.random() < catchRate;

      if (caught) {
        if (team.length < 6) {
          setTeam((prev) => [...prev, createPokemon(enemy)]);

          setShowMessage(`${enemy.name} was caught and added to your team!`);
        } else {
          setShowMessage(`${enemy.name} was caught but your team is full!`);
          // (optional) implement future "Box" system
        }

        setTimeout(() => {
          setBattle({ ...battle, inBattle: false, enemy: null });
          setShowMessage("");
        }, 1500);
      } else {
        setShowMessage(`${enemy.name} broke free!`);
        setTimeout(() => setShowMessage(""), 1500);
        setBattle((prev) => ({ ...prev, turn: "enemy" }));
        setIsPlayerTurn(false);
      }
    }, 1000);
  }

  function switchToPokemon(index, fromFaint = false) {
    if (team[index].currentHP <= 0 || index === activePokemonIndex) return;

    setActivePokemonIndex(index);

    setShowSwitchMenu(false);
    setShowMessage(`Go, ${team[index].name}!`);

    setTimeout(() => {
      setShowMessage("");
      if (fromFaint) {
        setIsPlayerTurn(true); // 🔁 Give turn back to player
        setBattle((prev) => ({ ...prev, turn: "player" }));
      } else {
        setIsPlayerTurn(false); // Enemy goes next
        setBattle((prev) => ({ ...prev, turn: "enemy" }));
      }
    }, 1000);
  }

  function handleRun() {
    if (!battle.inBattle || !enemy || team.length === 0) return;

    const playerLevel = team[activePokemonIndex].level;
    const enemyLevel = enemy.level;

    // Base chance: 80%. Reduce 10% for every level the enemy is higher.
    const levelDiff = enemyLevel - playerLevel;
    const runChance = Math.max(0.2, 0.8 - levelDiff * 0.1); // Minimum 20%

    setShowMessage("Attempting to run...");

    setTimeout(() => {
      if (Math.random() < runChance) {
        setShowMessage("Got away safely!");
        setTimeout(() => {
          setBattle({ ...battle, inBattle: false, enemy: null });
          setShowMessage("");
        }, 1000);
      } else {
        setShowMessage("Couldn't escape!");
        setTimeout(() => {
          setBattle((prev) => ({ ...prev, turn: "enemy" }));
          setIsPlayerTurn(false);
          setShowMessage("");
        }, 1000);
      }
    }, 1000);
  }

  // Handle enemy's turn
  useEffect(() => {
    if (battle.turn === "enemy" && battle.inBattle && enemy) {
      const dmg = Math.floor(Math.random() * 8) + 4;

      setTimeout(() => {
        setShowMessage(`${enemy.name} used Tackle!`);

        setTimeout(() => {
          const newPlayerHP = Math.max(
            team[activePokemonIndex].currentHP - dmg,
            0
          );

          setTeam((prev) => {
            const updated = [...prev];
            updated[activePokemonIndex] = {
              ...updated[activePokemonIndex],
              currentHP: newPlayerHP,
            }; // 🔁 This already exists
            return updated;
          });

          if (newPlayerHP === 0) {
            const faintedTeam = [...team];
            faintedTeam[activePokemonIndex] = {
              ...faintedTeam[activePokemonIndex],
              currentHP: 0,
            };
            setTeam(faintedTeam); // ✅ Force update

            setShowMessage(`${faintedTeam[0].name} fainted!`);

            setTimeout(() => {
              const aliveIndex = faintedTeam.findIndex(
                (poke, i) => i !== 0 && poke.currentHP > 0
              );
              if (aliveIndex !== -1) {
                switchToPokemon(aliveIndex, true);
              } else {
                setBattle((prev) => ({
                  ...prev,
                  inBattle: false,
                  enemy: null,
                  turn: "player",
                  message: null,
                }));
              }
            }, 1000);
          } else {
            setBattle((prev) => ({
              ...prev,
              turn: "player",
            }));
            setIsPlayerTurn(true);
            setShowMessage("");

            // Update team with new HP
            setBattle((prev) => ({ ...prev }));
            setTeam((prev) => {
              const updated = [...prev];
              updated[0] = { ...updated[0], currentHP: newPlayerHP };
              return updated;
            });
          }
        }, 1000);
      }, 1000);
    }
  }, [battle.turn]);

  useEffect(() => {
    if (
      enemy &&
      !showCatchPrompt &&
      enemy.currentHP <= enemy.maxHP * 0.25 &&
      enemy.currentHP > 0 // Not fainted
    ) {
      setShowMessage(`${enemy.name} is weak! Do you want to try catching it?`);
      setShowCatchPrompt(true);
    }
  }, [enemy?.currentHP]);

  const activePokemon = team[activePokemonIndex] || {};

  return (
    <div className="fixed inset-0 z-50 bg-white p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Wild {enemy?.name} Appeared!</h2>
      <div className="flex justify-around w-full mt-2">
        <div className="text-center">
          <img src={activePokemon.sprite} className="w-24" alt="Your Pokémon" />
          {/* Types for player's Pokémon */}
          <div className="flex justify-center gap-1 mt-1">
            {activePokemon.type.map((t) => (
              <img
                key={t}
                src={`/assets/types/${t.toLowerCase()}.png`}
                alt={t}
                className="w-fit"
                title={t}
              />
            ))}
          </div>
          <p className="mt-1">
            {activePokemon.name} (Lv {activePokemon.level})
          </p>
          <HPBar current={activePokemon.currentHP} max={activePokemon.maxHP} />
          <p className="text-sm mt-1">
            HP: {activePokemon.currentHP}/{activePokemon.maxHP}
          </p>
          <XPBar
            currentXP={activePokemon.currentXP}
            level={activePokemon.level}
          />
          <p className="text-xs mt-1">
            XP: {activePokemon.currentXP}/{activePokemon.level * 20}
          </p>
        </div>
        <div className="text-center">
          <img src={enemy?.sprite} className="w-24" alt="Enemy" />

          {/* Types for enemy Pokémon */}
          <div className="flex justify-center gap-1 mt-1">
            {enemy?.type.map((t) => (
              <img
                key={t}
                src={`/assets/types/${t.toLowerCase()}.png`}
                alt={t}
                className="w-fit"
                title={t}
              />
            ))}
          </div>

          <p className="mt-1">{enemy?.name}</p>
          <HPBar current={enemy?.currentHP} max={enemy?.maxHP} />
          <p className="text-sm mt-1">
            HP: {enemy?.currentHP}/{enemy?.maxHP}
          </p>
        </div>
      </div>
      {/* Message Box */}
      {showMessage && (
        <div className="mt-4 bg-gray-200 text-center p-2 rounded w-full">
          {showMessage}
        </div>
      )}
      {/* Catch Prompt UI */}
      {showCatchPrompt && (
        <div className="flex gap-2 mt-4 w-full justify-center">
          <button
            onClick={() => {
              setShowCatchPrompt(false);
              handleCatch();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ✅ Try to Catch
          </button>
          <button
            onClick={() => {
              setShowCatchPrompt(false);
              setShowMessage("");
              setBattle((prev) => ({ ...prev, turn: "enemy" }));
              setIsPlayerTurn(false);
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            ❌ Keep Fighting
          </button>
        </div>
      )}
      {/* Move Buttons */}
      {battle.turn === "player" && !showMessage && !showCatchPrompt && (
        <div className="mt-4 w-full">
          {activePokemon.moves.map((move) => (
            <button
              key={move}
              onClick={() => handleAttack(move)}
              className="bg-blue-500 text-white px-4 py-2 m-2 rounded"
            >
              {move}
            </button>
          ))}
        </div>
      )}
      {/* Switch Pokémon Button */}
      {!showCatchPrompt && (
        <div className="mt-2 w-full">
          <button
            disabled={team.length <= 1}
            onClick={() => setShowSwitchMenu(true)}
            className={`px-4 py-2 m-2 rounded w-full text-white ${
              team.length <= 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            🔁 Switch Pokémon
          </button>
        </div>
      )}
      {/* Bag Button */}
      {!showCatchPrompt && (
        <div className="mt-2 w-full">
          <button
            onClick={() => setShowBag(true)}
            className="bg-purple-600 text-white px-4 py-2 m-2 rounded w-full"
          >
            🎒 Open Bag
          </button>
        </div>
      )}
      {/* Catch Button */}
      {!showCatchPrompt && enemy?.currentHP > 0 && (
        <div className="mt-2 w-full">
          <button
            onClick={handleCatch}
            className="bg-green-600 text-white px-4 py-2 m-2 rounded w-full"
          >
            🎯 Throw Pokéball (
            {inventory.pokeball === 0
              ? `None Available`
              : `${inventory.pokeball} Remaining`}
            )
          </button>
        </div>
      )}
      {/* Run Button */}
      {!showCatchPrompt && (
        <div className="mt-2 w-full">
          <button
            onClick={handleRun}
            className="bg-red-600 text-white px-4 py-2 m-2 rounded w-full"
          >
            🏃‍♂️ Run from Battle
          </button>
        </div>
      )}
      {/* Show Team when Switch Button is Clicked */}
      {showSwitchMenu && (
        <div className="bg-white border p-3 rounded mt-3 w-full">
          <h3 className="text-center font-bold mb-2">Choose a Pokémon</h3>
          <div className="grid grid-cols-2 gap-2">
            {team.map((poke, idx) => (
              <button
                key={idx}
                onClick={() => switchToPokemon(idx)}
                disabled={idx === activePokemonIndex || poke.currentHP <= 0}
                className={`border p-2 rounded text-sm ${
                  idx === activePokemonIndex || poke.currentHP <= 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                <img src={poke.sprite} className="w-12 h-12 mx-auto" />
                <p className="font-semibold">{poke.name}</p>
                <p className="text-xs">
                  HP: {poke.currentHP}/{poke.maxHP}
                </p>
              </button>
            ))}
            {team.filter((poke, i) => poke.currentHP > 0 && i !== 0).length ===
              0 && (
              <p className="text-center text-sm col-span-2 text-gray-500">
                No healthy Pokémon available.
              </p>
            )}
          </div>
        </div>
      )}
      {/* Show Bag when Bag Button is Clicked */}
      {showBag && <BattleBagModal onClose={() => setShowBag(false)} />}
    </div>
  );
}
