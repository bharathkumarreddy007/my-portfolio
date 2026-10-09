import React, { lazy, Suspense, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  Code2,
  MapPin,
  Sparkles,
  Shuffle,
  Smile,
  CornerDownRight,
  MoveUpRight,
} from "lucide-react";
import { Reveal, useMotionEnabled } from "./ui";
const ThreeScene = lazy(() => import("./ThreeScene"));

export function Tilt({ children, className = "", intensity = 4 }) {
  const active = useMotionEnabled();
  const x = useMotionValue(0),
    y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 180, damping: 22 });
  const rotateY = useSpring(y, { stiffness: 180, damping: 22 });
  function move(event) {
    if (!active || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((0.5 - (event.clientY - rect.top) / rect.height) * intensity);
    y.set(((event.clientX - rect.left) / rect.width - 0.5) * intensity);
  }
  return (
    <motion.div
      className={className}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{
        rotateX: active ? rotateX : 0,
        rotateY: active ? rotateY : 0,
        transformPerspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
export function Burst({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m50 0 8 25L79 9l-6 26 27-1-22 16 22 16-27-1 6 26-21-16-8 25-8-25-21 16 6-26-27 1 22-16L0 34l27 1-6-26 21 16Z" />
    </svg>
  );
}
const positions = [
  [
    { x: 0, y: 0, r: -12 },
    { x: 0, y: 0, r: 11 },
    { x: 0, y: 0, r: -9 },
  ],
  [
    { x: 22, y: 25, r: 19 },
    { x: -18, y: -28, r: -12 },
    { x: 18, y: -19, r: 16 },
  ],
  [
    { x: -13, y: 12, r: -24 },
    { x: 21, y: 15, r: 20 },
    { x: -18, y: 9, r: -19 },
  ],
];
export default function CreativeHero({ profile, photo, mood, setMood }) {
  const bounds = useRef(null),
    [layout, setLayout] = useState(0);
  const active = useMotionEnabled();
  const icons = [
    <Code2 key="code" size={31} />,
    <Smile key="smile" size={50} />,
    <Sparkles key="sparkle" size={28} />,
  ];
  return (
    <section id="home" className="hero section-shell">
      <div className="hero-copy">
        <Reveal>
          <div className="hero-intro">
            <span className="intro-line" /> HELLO WORLD. I’M{" "}
            {profile.shortName.toUpperCase()}.
          </div>
          <h1>
            {profile.headline.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "headline-pop" : ""}>
                {line}
              </span>
            ))}
          </h1>
          <div className="hero-role">
            <CornerDownRight
              className="hand-arrow"
              size={27}
              aria-hidden="true"
            />
            <span>{profile.role}</span>
          </div>
          <p className="hero-description">{profile.intro}</p>
          <div className="hero-actions">
            <a href="#work" className="button button-dark">
              Explore my work <ArrowUpRight size={21} />
            </a>
            <a href="#contact" className="hero-secondary">
              Say hello <ArrowUpRight size={19} />
            </a>
          </div>
          <div className="mood-picker">
            <span>A little color therapy.</span>
            <div role="group" aria-label="Choose a color mood">
              {[
                ["violet", "Violet", "#7846ff"],
                ["blue", "Electric blue", "#2263ed"],
                ["pink", "Hot pink", "#e83691"],
              ].map(([id, name, color]) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`${name} mood`}
                  aria-pressed={mood === id}
                  style={{ "--swatch": color }}
                  onClick={() => setMood(id)}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      <Reveal className="hero-collage" delay={0.12}>
        <div className="collage-stage" ref={bounds}>
          <div className="collage-grid" aria-hidden="true" />
          <div className="collage-orbit" aria-hidden="true" />
          <span className="collage-heading" aria-hidden="true">
            STAY
            <br />
            CURIOUS.
          </span>
          <Tilt className="portrait-card" intensity={7}>
            <div className="portrait-card-top">
              <span className="status-dot" />
              <span>{profile.availability}</span>
              <span className="mini-sparkle">
                <Sparkles size={15} />
              </span>
            </div>
            <div className="portrait-frame">
              <img src={photo || undefined} alt={profile.name} />
            </div>
            <div className="portrait-caption">
              <span>{profile.name}</span>
              <small>
                <MapPin size={12} />
                {profile.location} · Building everywhere.
              </small>
            </div>
          </Tilt>
          <div className="hello-sticker">
            oh, hey! <span>✌</span>
          </div>
          <div className="code-sticker" aria-hidden="true">
            <div>
              <i />
              <i />
              <i />
            </div>
            <code>
              <span>const</span> me = {"{"}
              <br />
              &nbsp; curiosity: <em>"∞"</em>,<br />
              &nbsp; coffee: <em>true</em>
              <br />
              {"}"};
            </code>
          </div>
          {icons.map((icon, i) => (
            <motion.div
              key={i}
              className={`floating-shape shape-${i}`}
              aria-hidden="true"
              drag={active}
              dragConstraints={bounds}
              dragElastic={0.1}
              dragMomentum={false}
              animate={{
                x: positions[layout][i].x,
                y: positions[layout][i].y,
                rotate: positions[layout][i].r,
              }}
              transition={
                active
                  ? { type: "spring", stiffness: 120, damping: 14 }
                  : { duration: 0 }
              }
            >
              {i === 2 ? <Burst /> : icon}
            </motion.div>
          ))}
          <button
            type="button"
            className="shuffle-button"
            onClick={() => setLayout((layout + 1) % positions.length)}
          >
            <Shuffle size={14} />
            Shuffle the shapes
          </button>
          <span className="collage-note">a work in progress. always.</span>
        </div>
      </Reveal>
      <div className="hero-bottom">
        <a href="#work">
          <ArrowDown size={16} />
          <span>GOOD STUFF BELOW</span>
        </a>
        <p>Ideas → experiments → something real.</p>
        <span className="availability">
          <span className="status-dot" />
          {profile.availability}
        </span>
      </div>
    </section>
  );
}
export function Playground() {
  const stageRef = useRef(null);
  const nearby = useInView(stageRef, { once: true, margin: "400px" });
  const [round, setRound] = useState(0),
    [message, setMessage] = useState("");
  const active = useMotionEnabled();
  const words = [
    "A little curiosity goes a long way.",
    "Make something that makes you smile.",
    "The next good idea starts with a click.",
  ];
  function play() {
    setRound((r) => r + 1);
    setMessage(words[round % words.length]);
  }
  return (
    <section
      className="playground section-shell"
      ref={stageRef}
      aria-label="Creative playground"
    >
      <Reveal className="playground-panel">
        <div className="playground-copy">
          <span className="eyebrow">ENTER THE THIRD DIMENSION</span>
          <h2>
            Ideas, with
            <br />
            <span>another dimension.</span>
          </h2>
          <p>
            A little code. A little curiosity. A whole new perspective. Drag the
            sculpture, change the composition, and see where it takes you.
          </p>
          <button className="button button-white" onClick={play}>
            <Sparkles size={17} />
            Make something happen <ArrowUpRight size={18} />
          </button>
          <span className="playground-message" role="status">
            {message || "Go on. That button is asking for it."}
          </span>
        </div>
        <div className="playground-shapes">
          <Suspense
            fallback={
              <div className="scene-loading">Sculpting something good…</div>
            }
          >
            {nearby ? (
              <ThreeScene active={active} round={round} />
            ) : (
              <div className="scene-loading">
                A new perspective is coming into view.
              </div>
            )}
          </Suspense>
          {round > 0 && active && (
            <div className="confetti" key={round}>
              {Array.from({ length: 20 }, (_, i) => (
                <motion.i
                  key={i}
                  style={{
                    background: ["#d7ff70", "#ffafcc", "#ffe383", "#fff"][
                      i % 4
                    ],
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{
                    x: Math.cos(i * 2.4) * (90 + i * 7),
                    y: Math.sin(i * 2.4) * (80 + i * 5),
                    opacity: 0,
                    rotate: i * 46,
                    scale: 0.4,
                  }}
                  transition={{
                    duration: 1.3,
                    delay: i * 0.012,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
