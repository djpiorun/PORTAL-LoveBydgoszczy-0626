import { useEffect, useState } from "react";

export function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (start === end) return;

    const startTime = Date.now();
    const diff = end - start;

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function (easeOutCubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(start + diff * easeOut);

      setCount(currentCount);

      if (progress === 1) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, start, duration]);

  return count;
}
