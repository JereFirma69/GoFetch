import { useEffect, useState } from "react";

export default function ChatTimer({ endTime }) {
  const [remaining, setRemaining] = useState(0);

  //postavlja na sat vremena
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(
        Math.max(0, new Date(endTime).getTime() - Date.now())
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const min = Math.floor(remaining / 60000);
  const sec = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  return (
    <p className="text-xs text-gray-600">
      Preostalo: <span className="font-medium">{min}:{sec}</span>
    </p>
  );
}
