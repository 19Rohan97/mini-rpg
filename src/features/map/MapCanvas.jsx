import { useEffect, useRef, useState } from "react";
import { useGame } from "../../context/GameContext";

const tileSize = 40;
const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 2, 2, 2, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 2, 2, 1, 0, 1, 1],
  [1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 1, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const objectMap = [
  [null, null, null, null, null, null, null, null, null, null],
  [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    { type: "sign", message: "Welcome to Route 1!" },
    null,
  ],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null, null],
  [
    null,
    null,
    null,
    { type: "npc", name: "Old Man", message: "Stay on the path, traveler!" },
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  [null, null, null, null, null, null, null, null, null, null],
];

const tileset = new Image();
tileset.src = "/assets/tiles.png";

const playerSprite = new Image();
playerSprite.src = "/assets/player.png";

const signSprite = new Image();
signSprite.src = "/assets/sign.png";

const npcSprite = new Image();
npcSprite.src = "/assets/npc.png";

export default function MapCanvas() {
  const [facing, setFacing] = useState("down");
  const [message, setMessage] = useState("");

  const canvasRef = useRef(null);
  const { player, movePlayer } = useGame();

  function getFacingTile(x, y, dir) {
    if (dir === "up") return { x, y: y - 1 };
    if (dir === "down") return { x, y: y + 1 };
    if (dir === "left") return { x: x - 1, y };
    if (dir === "right") return { x: x + 1, y };
  }

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

          // Draw signpost if present
          const object = objectMap[y][x];
          if (object?.type === "sign") {
            ctx.drawImage(
              signSprite,
              x * tileSize,
              y * tileSize,
              tileSize,
              tileSize
            );
          }

          if (object?.type === "npc") {
            ctx.drawImage(
              npcSprite,
              x * tileSize,
              y * tileSize,
              tileSize,
              tileSize
            );
          }
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
      if (e.key === "ArrowUp") {
        setFacing("up");
        movePlayer(0, -1, map);
      } else if (e.key === "ArrowDown") {
        setFacing("down");
        movePlayer(0, 1, map);
      } else if (e.key === "ArrowLeft") {
        setFacing("left");
        movePlayer(-1, 0, map);
      } else if (e.key === "ArrowRight") {
        setFacing("right");
        movePlayer(1, 0, map);
      }

      if (e.key === "Enter") {
        const { x, y } = getFacingTile(player.x, player.y, facing);
        const obj = objectMap[y]?.[x];

        if (obj?.type === "sign" || obj?.type === "npc") {
          setMessage(obj.message);
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [movePlayer]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="bg-white block mx-auto mb-4"
      ></canvas>

      {message && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border p-3 rounded shadow-lg max-w-xs text-center z-50">
          <p>{message}</p>
          <button
            onClick={() => setMessage("")}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          >
            OK
          </button>
        </div>
      )}
    </>
  );
}
