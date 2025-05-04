export default function HPBar({ current, max }) {
  const percentage = (current / max) * 100;

  let barColor = "bg-green-500";
  if (percentage < 50) barColor = "bg-yellow-400";
  if (percentage < 25) barColor = "bg-red-500";

  return (
    <div className="w-32 h-3 bg-gray-300 rounded overflow-hidden mt-1">
      <div
        className={`h-full ${barColor} transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
