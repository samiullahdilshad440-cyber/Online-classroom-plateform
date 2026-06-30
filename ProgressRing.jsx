import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }) => {
  const circleRef = useRef(null);
  const textRef = useRef(null);
  
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (circleRef.current && textRef.current) {
      // Animate the ring stroke
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        {
          strokeDashoffset: circumference - (circumference * progress) / 100,
          duration: 1.5,
          ease: 'power2.out',
        }
      );
      
      // Animate the number counting up (Telemetry readout)
      gsap.fromTo(
        textRef.current,
        { innerText: 0 },
        {
          innerText: progress,
          duration: 1.5,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate: function() {
            textRef.current.innerText = Math.round(this.targets()[0].innerText) + '%';
          }
        }
      );
    }
  }, [progress, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={center} cy={center} r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="stroke-border"
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={center} cy={center} r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="stroke-accent"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px rgba(210, 255, 0, 0.5))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span ref={textRef} className="font-mono text-2xl font-bold text-text">0%</span>
        <span className="text-text-muted text-[10px] font-mono uppercase tracking-widest">Fuel</span>
      </div>
    </div>
  );
};

export default ProgressRing;