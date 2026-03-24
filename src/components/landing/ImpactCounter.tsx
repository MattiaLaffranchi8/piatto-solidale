"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // easeOutExpo
    const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      setValue(Math.floor(ease(progress) * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      }
    };

    rafId.current = requestAnimationFrame(step);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return value;
}

function Counter({ value, label }: { value: number; label: string }) {
  const count = useCountUp(value);
  return (
    <div className="text-center">
      <div className="font-mono text-5xl md:text-6xl font-bold text-white mb-2">
        {count.toLocaleString("it-IT")}
      </div>
      <div className="text-sm text-white/70 uppercase tracking-widest">{label}</div>
    </div>
  );
}

interface ImpactCounterProps {
  meals: number;
  donors: number;
  restaurants: number;
}

export function ImpactCounter({ meals, donors, restaurants }: ImpactCounterProps) {
  return (
    <section
      className="py-20 px-4"
      style={{ backgroundColor: "var(--primary-dark)" }}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl text-white text-center mb-12 opacity-90">
          Il nostro impatto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <Counter value={meals} label="Pasti serviti" />
          <Counter value={donors} label="Donatori attivi" />
          <Counter value={restaurants} label="Ristoranti aderenti" />
        </div>
      </div>
    </section>
  );
}
