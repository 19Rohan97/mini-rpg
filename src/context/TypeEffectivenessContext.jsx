import { createContext, useContext, useEffect, useState } from "react";
import { fetchTypeEffectiveness } from "../utils/fetchTypeEffectiveness";

const TypeEffectivenessContext = createContext();

export function TypeEffectivenessProvider({ children }) {
  const [effectivenessData, setEffectivenessData] = useState({});

  useEffect(() => {
    async function preloadTypes() {
      const types = [
        "fire",
        "water",
        "grass",
        "electric",
        "rock",
        "ground",
        "bug",
        "flying",
        "ice",
        "steel",
        "normal",
        "poison",
        "fighting",
        "psychic",
        "ghost",
        "dragon",
        "fairy",
        "dark",
      ];

      const allData = {};
      for (const type of types) {
        const result = await fetchTypeEffectiveness(type);
        allData[type] = result;
      }
      setEffectivenessData(allData);
    }

    preloadTypes();
  }, []);

  return (
    <TypeEffectivenessContext.Provider value={effectivenessData}>
      {children}
    </TypeEffectivenessContext.Provider>
  );
}

export function useTypeEffectiveness() {
  return useContext(TypeEffectivenessContext);
}
