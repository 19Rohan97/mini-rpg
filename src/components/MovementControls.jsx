import { useGame } from "../context/GameContext";
import { map } from "../data/map";

export default function MovementControls() {
  const { movePlayer } = useGame();

  return (
    <div className="flex justify-center mt-4 md:hidden">
      <div className="grid grid-cols-3 gap-2 text-white text-xl font-bold">
        <div></div>
        <button
          onClick={() => movePlayer(0, -1, map)}
          className="bg-gray-800 p-4 rounded-full"
        >
          ⬆
        </button>
        <div></div>
        <button
          onClick={() => movePlayer(-1, 0, map)}
          className="bg-gray-800 p-4 rounded-full"
        >
          ⬅
        </button>
        <div></div>
        <button
          onClick={() => movePlayer(1, 0, map)}
          className="bg-gray-800 p-4 rounded-full"
        >
          ➡
        </button>
        <div></div>
        <button
          onClick={() => movePlayer(0, 1, map)}
          className="bg-gray-800 p-4 rounded-full"
        >
          ⬇
        </button>
      </div>
    </div>
  );
}
