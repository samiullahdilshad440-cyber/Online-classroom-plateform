import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const StatCard = ({ label, value, prefix = '', suffix = '', icon, accent = false }) => {
  const valueRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (valueRef.current && typeof value === 'number') {
      gsap.fromTo(
        valueRef.current,
        { innerText: 0 },
        {
          innerText: value,
          duration: 1.5,
          ease: 'power2.out',
          snap: { innerText: value % 1 === 0 ? 1 : 0.01 },
          onUpdate: function () {
            const current = this.targets()[0].innerText;
            valueRef.current.innerText = prefix + (value % 1 === 0 ? Math.round(current) : Number(current).toFixed(2)) + suffix;
          }
        }
      );
    }

    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [value, prefix, suffix]);

  return (
    <div
      ref={cardRef}
      className={`p-6 rounded-xl border backdrop-blur-md ${
        accent
          ? 'border-accent bg-surface shadow-[0_0_20px_rgba(210,255,0,0.1)]'
          : 'border-border bg-surface'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-text-muted font-mono text-xs uppercase tracking-widest">{label}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div ref={valueRef} className="font-mono text-4xl font-bold text-text">
        {prefix}0{suffix}
      </div>
    </div>
  );
};

export default StatCard;