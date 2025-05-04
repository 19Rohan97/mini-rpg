import { useEffect, useRef } from "react";
import { useGame } from "../../context/GameContext";

const tileSize = 40;
const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 2, 2, 2, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 2, 2, 1, 0, 1, 1],
  [1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 1, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const tileset = new Image();
tileset.src = "/assets/tiles.png";

const playerSprite = new Image();
playerSprite.src = "/assets/player.png";

export default function MapCanvas() {
  const canvasRef = useRef(null);
  const { player, movePlayer } = useGame();

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");

    function drawMap() {
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
          const tile = map[y][x];
          ctx.drawImage(
            tileset,
            tile * 32,
            0,
            32,
            32,
            x * tileSize,
            y * tileSize,
            tileSize,
            tileSize
          );
        }
      }

      ctx.drawImage(
        playerSprite,
        player.x * tileSize,
        player.y * tileSize,
        tileSize,
        tileSize
      );
    }

    tileset.onload = drawMap;
    playerSprite.onload = drawMap;
    drawMap();
  }, [player]);

  // Handle keyboard movement
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowUp") movePlayer(0, -1, map);
      else if (e.key === "ArrowDown") movePlayer(0, 1, map);
      else if (e.key === "ArrowLeft") movePlayer(-1, 0, map);
      else if (e.key === "ArrowRight") movePlayer(1, 0, map);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [movePlayer]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="bg-white block mx-auto mb-4"
    ></canvas>
  );
}
