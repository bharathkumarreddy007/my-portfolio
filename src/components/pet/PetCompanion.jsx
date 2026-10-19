import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import Pet from "./Pet";
import { EASE } from "../ui";

const PALETTE = ["#a78bfa", "#22d3ee", "#f472b6", "#ffb545", "#ffffff"];

const POKE_LINES = [
  "Boop!",
  "Eep!",
  "Again!",
  "Hehe.",
  "That tickles.",
  "Weh!",
  "More?",
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function PetCompanion() {
  const reduced = useReducedMotion();

  const [expression, setExpression] = useState("idle");
  const [action, setAction] = useState("idle");
  const [pose, setPose] = useState("idle");
  const [phase, setPhase] = useState("free");
  const [speech, setSpeech] = useState(null);
  const [bubbleForm, setBubbleForm] = useState(false);
  const [apology, setApology] = useState("");
  const [hint, setHint] = useState("");
  const [petting, setPetting] = useState(false);
  const [running, setRunning] = useState(false);
  const [atFinale, setAtFinale] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [bursts, setBursts] = useState([]);
  const [hearts, setHearts] = useState([]);

  const timers = useRef([]);
  const moodToken = useRef(0);
  const speechToken = useRef(0);
  const clicks = useRef([]);
  const phaseRef = useRef("free");
  const runningRef = useRef(false);
  const rollDist = useRef(0);
  const burstId = useRef(0);
  const heartId = useRef(0);
  const dragRef = useRef(null);
  const figureRef = useRef(null);

  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const dragX = useSpring(0, { stiffness: 320, damping: 28, mass: 0.6 });
  const dragY = useSpring(0, { stiffness: 320, damping: 28, mass: 0.6 });

  /* ----------------------------- timers ---------------------------- */

  const later = useCallback((fn, ms) => {
    const id = window.setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== id);
      fn();
    }, ms);
    timers.current.push(id);
    return id;
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* ---------------------------- speech ----------------------------- */

  const say = useCallback(
    (text, ms = 4200, opts = {}) => {
      const token = ++speechToken.current;
      const form = Boolean(opts.form);
      setSpeech({ text });
      setBubbleForm(form);
      if (ms > 0) {
        later(() => {
          if (speechToken.current !== token) return;
          setSpeech(null);
          setBubbleForm(false);
        }, ms);
      }
    },
    [later],
  );

  const setMood = useCallback(
    (value, ms = 0, fallback = "idle") => {
      const token = ++moodToken.current;
      setExpression(value);
      if (ms > 0) {
        later(() => {
          if (moodToken.current === token) setExpression(fallback);
        }, ms);
      }
    },
    [later],
  );

  /* ---------------------------- sparkles --------------------------- */

  const spawnBurst = useCallback(
    (x, y, kind = "spark") => {
      if (reduced) return;
      const id = ++burstId.current;
      const count = kind === "heart" ? 7 : 11;
      const parts = Array.from({ length: count }, (_, i) => {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.55;
        const dist = 26 + Math.random() * 48;
        return {
          i,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - 16,
          scale: 0.45 + Math.random() * 0.9,
          rotate: Math.random() * 240 - 120,
          color: PALETTE[i % PALETTE.length],
          star: kind === "spark" && i % 3 === 0,
        };
      });
      setBursts((list) => [...list.slice(-5), { id, x, y, parts }]);
      later(() => setBursts((list) => list.filter((b) => b.id !== id)), 1000);
    },
    [later, reduced],
  );

  /* --------------------------- apologies --------------------------- */

  const startRevenge = useCallback(() => {
    setPhase("revenge");
    phaseRef.current = "revenge";
    setBubbleForm(false);
    setSpeech(null);
    setPose("idle");
    setMood("akanbe");
    setAction("cheer");
    say("Pffft. 😝", 2000);

    later(() => {
      setMood("laugh");
      setAction("belly");
      setPose("laugh");
      say("HAHAHA! You should see your face!", 2400);
    }, 2100);

    later(() => {
      setPose("fallen");
      setAction("tap");
      say("Oh— I can't— I can't breathe—", 2300);
    }, 4600);

    later(() => {
      setPose("idle");
      setAction("idle");
      setMood("happy");
      say("Okay, okay… sorry. Just kidding. 😅", 2800);
    }, 7000);

    later(() => {
      setPhase("free");
      phaseRef.current = "free";
      setMood("idle");
      say(
        "You just seemed a little dull today, so I had to make fun of you. Come on — keep petting me.",
        5400,
      );
    }, 10000);
  }, [later, say, setMood]);

  const becomeAngry = useCallback(() => {
    setPhase("annoyed");
    phaseRef.current = "annoyed";
    setMood("angry");
    setAction("idle");
    setPose("idle");
    setPetting(false);
    clicks.current = [];
    say("Hey! Stop, dude. I'm exhausted by your actions.", 3200);

    later(() => {
      setPhase("awaiting");
      phaseRef.current = "awaiting";
      say("Hmmph. Fine. Say sorry to me — type it here. 👇", 0, {
        form: true,
      });
    }, 2300);
  }, [later, say, setMood]);

  const submitApology = (event) => {
    event.preventDefault();
    const value = apology.trim();
    if (!value) {
      setHint("Type something first. I'm waiting.");
      return;
    }
    if (!/sorry|apolog|forgive|sori|maaf|kshama/i.test(value)) {
      setHint("Hmm… that didn't sound sorry. Try again.");
      setMood("angry", 1100);
      return;
    }
    setHint("");
    setApology("");
    startRevenge();
  };

  /* ----------------------------- poking ---------------------------- */

  const poke = useCallback(() => {
    if (phaseRef.current !== "free") {
      if (phaseRef.current === "awaiting") say("Say sorry first. 😤", 2400);
      else if (phaseRef.current === "annoyed") say("Ow. Ow. OW.", 1800);
      return;
    }
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 4000), now];
    if (clicks.current.length >= 5) {
      becomeAngry();
      return;
    }
    setMood("excited", 700);
    setAction("cheer");
    later(() => setAction("idle"), 540);
    if (clicks.current.length <= 2 || Math.random() > 0.45) {
      say(pick(POKE_LINES), 2000);
    }
  }, [becomeAngry, later, say, setMood]);

  /* ------------------------------ drag ----------------------------- */

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      /* synthetic pointer — ignore */
    }
    dragRef.current = {
      id: event.pointerId,
      sx: event.clientX,
      sy: event.clientY,
      moved: false,
    };
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.sx;
    const dy = event.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 7) {
      drag.moved = true;
      setAction("shy");
    }
    if (drag.moved && !reduced) {
      dragX.set(dx);
      dragY.set(dy);
    }
  };

  const onPointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    if (drag.moved) {
      dragX.set(0);
      dragY.set(0);
      setAction("idle");
      if (phaseRef.current === "free") say("Wheee! Put me down!", 2200);
      return;
    }
    spawnBurst(event.clientX, event.clientY);
    poke();
  };

  const onPointerCancel = () => {
    dragRef.current = null;
    dragX.set(0);
    dragY.set(0);
    setAction("idle");
  };

  const onKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const rect = figureRef.current?.getBoundingClientRect();
    if (rect) {
      spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      poke();
    }
  };

  const onDoubleClick = () => {
    if (phaseRef.current !== "free") return;
    setSpinKey((k) => k + 1);
    setMood("smug", 1300);
    say("Wheee!", 1600);
  };

  /* --------------------------- petting ----------------------------- */

  const onEnter = () => {
    if (phaseRef.current !== "free") return;
    setPetting(true);
  };

  const onLeave = () => setPetting(false);

  useEffect(() => {
    if (!petting) return undefined;
    setMood("happy");
    setAction("shy");

    const spawn = () => {
      if (reduced) return;
      const id = ++heartId.current;
      const dx = Math.random() * 46 - 23;
      setHearts((list) => [
        ...list.slice(-6),
        {
          id,
          dx,
          rot: Math.random() * 44 - 22,
          scale: 0.7 + Math.random() * 0.6,
        },
      ]);
      later(() => setHearts((list) => list.filter((h) => h.id !== id)), 1900);
    };

    spawn();
    const interval = window.setInterval(spawn, 850);

    return () => {
      window.clearInterval(interval);
      if (phaseRef.current === "free") {
        setMood("idle");
        setAction("idle");
      }
    };
  }, [petting, later, reduced, setMood]);

  /* ------------------------ site-wide clicks ----------------------- */

  useEffect(() => {
    const onClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".pet-figure")) return;

      spawnBurst(event.clientX, event.clientY);

      if (phaseRef.current !== "free") return;
      if (
        target.closest("a, button, [role='button'], input, textarea, label")
      ) {
        setMood("excited", 900);
        setAction("cheer");
        later(() => setAction("idle"), 500);
      }
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [later, setMood, spawnBurst]);

  /* -------------------------- eye tracking ------------------------- */

  useEffect(() => {
    if (reduced) return undefined;
    const onMove = (event) => {
      const el = figureRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / 240;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / 240;
      lookX.set(Math.max(-1, Math.min(1, dx)) * 4.6);
      lookY.set(Math.max(-1, Math.min(1, dy)) * 4.2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [lookX, lookY, reduced]);

  /* ----------------------------- scroll ---------------------------- */

  useEffect(() => {
    let last = window.scrollY;
    let idle = 0;

    const onScroll = () => {
      const now = window.scrollY;
      const dy = now - last;
      last = now;
      const moved = Math.abs(dy);
      if (moved < 2) return;

      if (!runningRef.current) {
        runningRef.current = true;
        setRunning(true);
      }
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        runningRef.current = false;
        setRunning(false);
      }, 190);

      rollDist.current += moved;
      if (rollDist.current > 2600 && phaseRef.current === "free") {
        rollDist.current = 0;
        setSpinKey((k) => k + 1);
        setMood("smug", 1300);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
    };
  }, [setMood]);

  /* ------------------------ idle personality ----------------------- */

  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current) return undefined;
    greeted.current = true;
    const id = later(() => {
      setAction("wave");
      setMood("happy", 3200);
      say(
        "Hi! I'm Mochi — your portfolio pet. Pet me, click me, drag me. I only bite a little.",
        5600,
      );
      later(() => setAction("idle"), 3400);
    }, 3200);
    return () => window.clearTimeout(id);
  }, [later, say, setMood]);

  useEffect(() => {
    if (phase !== "free") return undefined;
    const interval = window.setInterval(() => {
      if (document.hidden || petting || runningRef.current) return;
      const roll = Math.random();
      if (roll < 0.5) {
        setAction("wave");
        later(() => setAction("idle"), 2200);
      } else if (roll < 0.8) {
        setMood("wink", 900);
      } else {
        setMood("curious", 1500);
      }
    }, 11000);

    return () => window.clearInterval(interval);
  }, [phase, petting, later, setMood]);

  /* -------------------------- hide at finale ----------------------- */

  useEffect(() => {
    const targets = [
      document.getElementById("hello"),
      document.querySelector(".site-footer"),
    ].filter(Boolean);
    if (!targets.length) return undefined;

    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        setAtFinale(visible.size > 0);
      },
      { threshold: 0.15 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  /* ----------------------------- render ---------------------------- */

  const motionState = pose !== "idle" ? pose : running ? "run" : "idle";

  return (
    <>
      <div
        className={`pet-companion ${atFinale ? "is-hidden" : ""}`}
        aria-hidden={atFinale || undefined}
      >
        <motion.div className="pet-drag" style={{ x: dragX, y: dragY }}>
          <AnimatePresence>
            {speech && !atFinale && (
              <motion.div
                key="bubble"
                className={`pet-bubble ${bubbleForm ? "has-form" : ""}`}
                initial={{ opacity: 0, y: 12, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.94 }}
                transition={{ duration: 0.34, ease: EASE }}
                role="status"
                aria-live="polite"
              >
                <span className="pet-bubble-text">{speech.text}</span>

                {bubbleForm && (
                  <form
                    className="pet-form"
                    onSubmit={submitApology}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    <div className="pet-form-row">
                      <input
                        value={apology}
                        onChange={(event) => {
                          setApology(event.target.value);
                          setHint("");
                        }}
                        placeholder="I'm sorry…"
                        aria-label="Type your apology"
                        maxLength={48}
                      />
                      <button type="submit">Send</button>
                    </div>
                    {hint && <span className="pet-hint">{hint}</span>}
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={figureRef}
            className="pet-figure"
            role="button"
            tabIndex={atFinale ? -1 : 0}
            aria-label="Mochi, the portfolio pet. Click to play, drag to move, double click to make it spin."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
            onKeyDown={onKeyDown}
            onDoubleClick={onDoubleClick}
          >
            <motion.div
              key={spinKey}
              initial={{ rotate: 0 }}
              animate={{ rotate: spinKey ? 360 : 0 }}
              transition={{ duration: 0.95, ease: [0.45, 0, 0.2, 1] }}
            >
              <Pet
                expression={expression}
                action={action}
                motionState={motionState}
                lookX={lookX}
                lookY={lookY}
                size={106}
              />
            </motion.div>

            <div className="pet-hearts" aria-hidden="true">
              <AnimatePresence>
                {hearts.map((heart) => (
                  <motion.span
                    key={heart.id}
                    className="pet-heart"
                    initial={{
                      opacity: 0,
                      y: 0,
                      x: heart.dx,
                      scale: 0.4,
                      rotate: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: -84,
                      scale: heart.scale,
                      rotate: heart.rot,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                  >
                    ♥
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {createPortal(
        <div className="pet-fx" aria-hidden="true">
          <AnimatePresence>
            {bursts.map((burst) => (
              <div
                key={burst.id}
                style={{ position: "absolute", left: burst.x, top: burst.y }}
              >
                {burst.parts.map((part) => (
                  <motion.span
                    key={part.i}
                    className={`pet-spark ${part.star ? "is-star" : ""}`}
                    style={{
                      background: part.color,
                      boxShadow: `0 0 10px ${part.color}`,
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: part.dx,
                      y: part.dy,
                      scale: [0, part.scale, 0],
                      opacity: [1, 1, 0],
                      rotate: part.rotate,
                    }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                ))}
              </div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </>
  );
}
