import React, { useState, useEffect, useCallback } from "react";

const CountdownTimer = ({ startTimeInSeconds, onTimeEnd, resetFlag }) => {
  const [timeLeft, setTimeLeft] = useState(startTimeInSeconds);

  useEffect(() => {
    setTimeLeft(startTimeInSeconds);
  }, [startTimeInSeconds, resetFlag]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeEnd) onTimeEnd();
      return;
    }

    // Start countdown
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (onTimeEnd) onTimeEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeEnd]);

  const formatTime = useCallback((totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return <span> {formatTime(timeLeft)}</span>;
};

export default CountdownTimer;
