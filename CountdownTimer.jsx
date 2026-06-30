import { useState, useEffect } from 'react';

const CountdownTimer = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(dueDate) - +new Date();
    
    if (difference <= 0) return { expired: true };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [dueDate]);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
        <span className="font-mono text-xs text-red-500 uppercase tracking-widest">EXPIRED</span>
      </div>
    );
  }

  // "Start lights" visual — red dots that fill as time runs out
  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isUrgent = totalSeconds < 3600; // Less than 1 hour

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              isUrgent ? 'bg-red-500 animate-pulse' : 'bg-accent'
            }`}
            style={{ opacity: i < Math.min(5, Math.floor(totalSeconds / 3600)) ? 1 : 0.2 }}
          ></div>
        ))}
      </div>
      <div className="font-mono text-sm text-text">
        {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
        <span className={isUrgent ? 'text-red-500' : 'text-accent'}>
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;