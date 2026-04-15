import { useState, useEffect, useRef } from 'react';

export const useAnimatedCounter = (end, duration = 1000, start = 0) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    // Use current count as the start value for the animation
    // But if we're animating to the same value, just return.
    const startVal = count;
    if (startVal === end) {
      setCount(end); // Ensure it's exactly the end value
      return;
    }

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (end - startVal) * eased);

      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [end, duration]);

  return count;
};

export default useAnimatedCounter;
