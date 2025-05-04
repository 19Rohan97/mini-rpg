export default function XPBar({ currentXP, level }) {
  const xpToNextLevel = level * 20; // simple XP curve: level * 20 XP needed
  const percentage = Math.min((currentXP / xpToNextLevel) * 100, 100);

  return (
    <div className="w-32 h-2 bg-gray-300 rounded overflow-hidden mt-1">
      <div
        className="h-full bg-blue-400 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
