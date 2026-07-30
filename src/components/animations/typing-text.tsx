"use client";

import { useEffect, useState } from "react";
import { typingFrame } from "@/lib/utils";

export function TypingText() {
  const [typed, setTyped] = useState("Ruththra");
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setTyped(typingFrame(now - start));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <p className="typing" aria-label="Welcome to the world of Ruththra">
      <span aria-hidden="true">
        Welcome to the world of <strong>{typed}</strong>
        <i>_</i>
      </span>
    </p>
  );
}
