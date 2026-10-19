import React, { useEffect, useRef, useState } from "react";
import { useMotionEnabled } from "./ui";

/* A two-part pointer: an instant dot and a lagging ring that grows and
 * picks up a label over anything interactive. Desktop + fine pointers only. */
export default function Cursor() {
  const ok = useMotionEnabled();
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!ok) return undefined;
    if (typeof window === "undefined") return undefined;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return undefined;
    }

    const root = document.documentElement;
    root.classList.add("has-cursor");

    let frame = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let dotX = targetX;
    let dotY = targetY;
    let ringX = targetX;
    let ringY = targetY;
    let shown = false;

    const loop = () => {
      dotX += (targetX - dotX) * 0.55;
      dotY += (targetY - dotY) * 0.55;
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(loop);
    };

    const onMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!shown) {
        shown = true;
        dotX = ringX = targetX;
        dotY = ringY = targetY;
        root.classList.add("cursor-on");
      }

      const hit = event.target instanceof Element ? event.target : null;
      const labelled = hit?.closest("[data-cursor]");
      const interactive = hit?.closest(
        'a, button, [role="button"], input, textarea, select, summary',
      );

      root.classList.toggle("cursor-hover", Boolean(interactive));
      const next = labelled?.getAttribute("data-cursor") || "";
      setText((current) => (current === next ? current : next));
    };

    const onLeave = () => root.classList.remove("cursor-on");
    const onEnter = () => root.classList.add("cursor-on");

    frame = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      root.classList.remove("has-cursor", "cursor-on", "cursor-hover");
    };
  }, [ok]);

  if (!ok) return null;

  return (
    <div className="cursor-layer" aria-hidden="true">
      <span className="cursor-dot" ref={dot} />
      <span className="cursor-ring" ref={ring}>
        <em ref={label}>{text}</em>
      </span>
    </div>
  );
}
