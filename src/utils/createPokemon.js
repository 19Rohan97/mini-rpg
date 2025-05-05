import { v4 as uuidv4 } from "uuid";

export function createPokemon({
  name,
  level = 1,
  maxHP = 40,
  type = [],
  sprite = "",
  moves = [],
}) {
  const scaledHP = maxHP + (level - 1) * 10;

  return {
    id: uuidv4(),
    name,
    level,
    maxHP: scaledHP,
    currentHP: scaledHP,
    currentXP: 0,
    type,
    sprite,
    moves: moves.length ? moves : ["Tackle"],
  };
}
