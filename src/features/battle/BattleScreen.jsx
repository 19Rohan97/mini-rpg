import { useGame } from "../../context/GameContext";
import { useEffect, useState } from "react";
import HPBar from "../../components/HPBar";
import XPBar from "../../components/XPBar";
import { createPokemon } from "../../utils/createPokemon";
import BattleBagModal from "./BattleBagModal";
import { fetchPokedexEntry } from "../../utils/fetchPokedexEntry";
import { fetchTypeEffectiveness } from "../../utils/fetchTypeEffectiveness"; //

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
  const [pokedexEntry, setPokedexEntry] = useState("");

  async function handleAttack(move) {
    if (!isPlayerTurn || !enemy || battle.turn !== "player") return;

    const effectiveness = await fetchTypeEffectiveness(move.type.toLowerCase());

    if (!effectiveness) {
      console.warn("No effectiveness data for", move.type);
      return; // Or fallback to normal effectiveness: multiplier = 1
    }

    let multiplier = 1;

    if (!Array.isArray(enemy?.type)) {
      console.warn("Enemy type missing or invalid", enemy);
      return;
    }

    for (const enemyType of enemy.type) {
      if (effectiveness?.double_damage_to?.includes(enemyType)) multiplier *= 2;
      if (effectiveness?.half_damage_to?.includes(enemyType)) multiplier *= 0.5;
      if (effectiveness?.no_damage_to?.includes(enemyType)) multiplier *= 0;
    }

    console.log("Enemy Type:", enemy.type);
    console.log("Effectiveness:", effectiveness);

    const baseDamage = Math.floor(Math.random() * 10) + 5;
    const damage = Math.floor(baseDamage * multiplier);
    const newHP = Math.max(enemy.currentHP - damage, 0);

    let effectivenessText = "";
    if (multiplier === 2) effectivenessText = "It's super effective!";
    else if (multiplier === 0.5)
      effectivenessText = "It's not very effective...";
    else if (multiplier === 0) effectivenessText = "It had no effect.";

    setShowMessage(
      `${team[activePokemonIndex].name} used ${move.name}! ${effectivenessText}`
    );

    setTimeout(() => {
      if (newHP <= 0) {
        const xpGained = 15 + Math.floor(Math.random() * 10);
        setShowMessage(`${enemy.name} fainted! Gained ${xpGained} XP!`);

        setTimeout(async () => {
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
      async function enemyTurn() {
        const move = enemy.moves[
          Math.floor(Math.random() * enemy.moves.length)
        ] || {
          name: "Tackle",
          type: "normal",
        };

        const effectiveness = await fetchTypeEffectiveness(
          move.type.toLowerCase()
        );

        if (!effectiveness) {
          console.warn("No effectiveness data for", move.type);
          return; // Or fallback to normal effectiveness: multiplier = 1
        }

        let multiplier = 1;
        for (const playerType of team[activePokemonIndex].type) {
          if (effectiveness?.double_damage_to?.includes(playerType))
            multiplier *= 2;
          if (effectiveness?.half_damage_to?.includes(playerType))
            multiplier *= 0.5;
          if (effectiveness?.no_damage_to?.includes(playerType))
            multiplier *= 0;
        }

        const baseDamage = Math.floor(Math.random() * 8) + 4;
        const dmg = Math.floor(baseDamage * multiplier);

        setTimeout(() => {
          setShowMessage(`${enemy.name} used ${move.name}!`);

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
              };
              return updated;
            });

            if (newPlayerHP === 0) {
              const faintedTeam = [...team];
              faintedTeam[activePokemonIndex] = {
                ...faintedTeam[activePokemonIndex],
                currentHP: 0,
              };
              setTeam(faintedTeam);

              setShowMessage(
                `${faintedTeam[activePokemonIndex].name} fainted!`
              );

              setTimeout(() => {
                const aliveIndex = faintedTeam.findIndex(
                  (poke, i) => i !== activePokemonIndex && poke.currentHP > 0
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
            }
          }, 1000);
        }, 1000);
      }

      enemyTurn(); // ✅ Call the inner async function
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

  useEffect(() => {
    async function loadEntry() {
      if (enemy?.name) {
        const entry = await fetchPokedexEntry(enemy.name.toLowerCase());
        setPokedexEntry(entry);
      }
    }

    loadEntry();
  }, [enemy]);

  const activePokemon = team[activePokemonIndex] || {};

  return (
    <div className="fixed inset-0 z-50 bg-white p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2">Wild {enemy?.name} Appeared!</h2>
      <div className="flex justify-around w-full mt-2">
        <div className="flex flex-col items-center text-center">
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
        <div className="flex flex-col items-center text-center">
          <img src={enemy?.sprite} className="w-24" alt="Enemy" />

          {/* Enemy Pokédex Entry */}
          {pokedexEntry && (
            <p className="text-xs text-center mt-2 italic max-w-xs mx-auto text-gray-600">
              “{pokedexEntry}”
            </p>
          )}

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

          <p className="mt-1 font-semibold">
            {enemy?.name} (Lv {enemy?.level})
          </p>

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
        <div className="mt-4 w-full flex items-center gap-3 flex-wrap">
          {activePokemon.moves.map((move, i) => (
            <button
              key={i}
              onClick={() => handleAttack(move)}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-4 justify-center"
            >
              {move.name}
              <img
                src={`/assets/types/${move.type.toLowerCase()}.png`}
                alt=""
              />
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
