import { useEffect, useState } from "react";
import { useGame } from "./context/GameContext";

import MapCanvas from "./features/map/MapCanvas";
import StarterSelection from "./features/team/StarterSelection";
import MovementControls from "./components/MovementControls";
import BattleScreen from "./features/battle/BattleScreen";
import TeamManagementScreen from "./features/team/TeamManagementScreen";
import BagScreen from "./features/inventory/BagScreen";
import PokedexScreen from "./features/pokedex/PokedexScreen";

import { preloadAllTypes } from "./utils/fetchTypeEffectiveness";

function App() {
  const { battle, handleNewGame } = useGame();

  const [starterChosen, setStarterChosen] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showBag, setShowBag] = useState(false);
  const [showPokedex, setShowPokedex] = useState(false);

  useEffect(() => {
    preloadAllTypes(); // one-time preload on startup
  }, []);

  return (
    <div className="min-h-screen bg-[url('/assets/bg.jpg')] bg-cover bg-left px-3 pt-24 md:pt-14">
      <div className="actions">
        {/* Actions */}
        {starterChosen && !battle.inBattle && (
          <div className="fixed top-2 right-2 z-50 flex gap-2 flex-wrap justify-center">
            {/* Toggle Button */}
            <button
              onClick={() => setShowTeam(!showTeam)}
              className="px-3 py-1 bg-yellow-500 text-white rounded"
            >
              🧢 {showTeam ? "Back to Map" : "Manage Team"}
            </button>

            {/* Pokedex */}
            <button
              onClick={() => setShowPokedex(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              📘 Pokédex
            </button>

            {/* Show Bag */}
            <button
              onClick={() => setShowBag(true)}
              className="px-3 py-1 bg-purple-400 text-white rounded"
            >
              🎒 Bag
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to start a new game? This will erase all progress."
                  )
                ) {
                  handleNewGame();
                  setStarterChosen(false); // Go back to StarterSelection
                  setShowTeam(false);
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              🔄 New Game
            </button>
          </div>
        )}
      </div>

      {/* Starter Chose Screen */}
      {!starterChosen && (
        <StarterSelection onStarterChosen={() => setStarterChosen(true)} />
      )}

      {/* Map Canvas */}
      {starterChosen && !battle.inBattle && <MapCanvas />}

      {/* Team Management Screen */}
      {starterChosen && showTeam && <TeamManagementScreen />}

      {/* Render Bag screen */}
      {showBag && <BagScreen onClose={() => setShowBag(false)} />}

      {/* Battle Screen */}
      {battle.inBattle && <BattleScreen />}

      {/* Pokedex Screen */}
      {showPokedex && <PokedexScreen onClose={() => setShowPokedex(false)} />}

      {/* Movement Controls for Mobile */}
      <MovementControls />
    </div>
  );
}

export default App;
