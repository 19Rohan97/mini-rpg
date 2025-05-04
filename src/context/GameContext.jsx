import { createContext, useContext, useEffect, useState } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [starterId, setStarterId] = usePersistentState("starter-id", null);
  const [activePokemonIndex, setActivePokemonIndex] = useState(0);

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

  const movePlayer = (dx, dy, map) => {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (map[newY]?.[newX] !== 1) {
      const updated = { ...player, x: newX, y: newY };
      setPlayer(updated);
      localStorage.setItem("playerData", JSON.stringify(updated));

      // Check for wild encounter on grass tile (tile === 2)
      if (map[newY][newX] === 2 && Math.random() < 0.3) {
        const enemy = {
          name: "Pidgey",
          level: 3,
          maxHP: 40,
          currentHP: 40,
          type: ["Flying"],
          sprite: "/assets/pokemons/1.png",
          moves: ["Tackle"],
        };
        setBattle({ ...battle, inBattle: true, enemy });
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
