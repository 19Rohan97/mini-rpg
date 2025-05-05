import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";
import { fetchPokemonData } from "../utils/fetchPokemonData";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [starterId, setStarterId] = usePersistentState("starter-id", null);
  const [activePokemonIndex, setActivePokemonIndex] = usePersistentState(
    "active-pokemon-index",
    0
  );

  const [player, setPlayer] = usePersistentState("playerData", {
    x: 1,
    y: 1,
    level: 1,
    xp: 0,
    maxHP: 100,
    currentHP: 100,
  });

  const [team, setTeam] = usePersistentState("pokemon-team", []);
  const [inventory, setInventory] = usePersistentState("pokemon-inventory", {
    pokeball: 5,
    potion: 3,
    superPotion: 5,
  });

  const [battle, setBattle] = useState({
    inBattle: false,
    playerHP: 100,
    enemyHP: 50,
    activePokemonIndex: 0,
    enemy: null,
    turn: "player", // 'player' or 'enemy'
    message: null,
  });

  const movePlayer = async (dx, dy, map) => {
    if (battleRef.current.inBattle) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (map[newY]?.[newX] !== 1) {
      const updated = { ...player, x: newX, y: newY };
      setPlayer(updated);
      localStorage.setItem("playerData", JSON.stringify(updated));

      // Wild encounter on grass tile (2)
      if (map[newY][newX] === 2 && Math.random() < 0.3) {
        // 🧠 Get average team level
        const avgLevel =
          team.length > 0
            ? Math.round(
                team.reduce((sum, p) => sum + p.level, 0) / team.length
              )
            : 3;

        const level = Math.max(
          2,
          Math.min(100, avgLevel + Math.floor(Math.random() * 3))
        ); // avg ± 2

        const randomId = Math.floor(Math.random() * 151) + 1; // First gen
        const enemyBase = await fetchPokemonData(randomId, level);

        if (!enemyBase) return;

        const scaled = {
          ...enemyBase,
          name: `${enemyBase.name}`,
          level,
          maxHP: enemyBase.maxHP + (level - 1) * 10,
          currentHP: enemyBase.maxHP + (level - 1) * 10,
        };
        scaled.currentHP = scaled.maxHP;

        setBattle((prev) => ({
          ...prev,
          inBattle: true,
          enemy: scaled,
        }));
      }
    }
  };

  function handleNewGame() {
    setTeam([]);
    setInventory({ pokeball: 5, potion: 3, superPotion: 5 });
    setPlayer({ x: 1, y: 1, level: 1, xp: 0, maxHP: 100, currentHP: 100 });
    setStarterId(null);
    setActivePokemonIndex(0);

    localStorage.removeItem("pokemon-team");
    localStorage.removeItem("pokemon-inventory");
    localStorage.removeItem("playerData");
    localStorage.removeItem("starter-id");
  }

  useEffect(() => {
    localStorage.setItem("playerData", JSON.stringify(player));
  }, [player]);

  useEffect(() => {
    localStorage.setItem("pokemon-team", JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem("pokemon-inventory", JSON.stringify(inventory));
  }, [inventory]);

  const battleRef = useRef(battle);

  useEffect(() => {
    battleRef.current = battle;
  }, [battle]);

  return (
    <GameContext.Provider
      value={{
        player,
        setPlayer,
        movePlayer,
        team,
        setTeam,
        inventory,
        setInventory,
        battle,
        setBattle,
        handleNewGame,
        starterId,
        setStarterId,
        activePokemonIndex,
        setActivePokemonIndex,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
