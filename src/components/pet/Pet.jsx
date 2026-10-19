import React, { useId } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import "./pet.css";

/* ------------------------------------------------------------------ *
 * Mochi — the portfolio pet.
 * One SVG character, many expressions. Everything is drawn with paths
 * and gradients so it stays crisp at any size and never needs an asset.
 * ------------------------------------------------------------------ */

const INK = "#1b1332";
const WHITE = "#fdfbff";
const BLUSH = "#fb7185";

const EXPRESSIONS = {
  idle: { eyes: "open", mouth: "smile", blink: true },
  happy: { eyes: "arc", mouth: "smileBig", blush: true },
  love: { eyes: "heart", mouth: "smile", blush: true },
  excited: { eyes: "big", mouth: "open", blink: true },
  curious: { eyes: "big", mouth: "o", blink: true },
  smug: { eyes: "half", mouth: "smirk" },
  angry: { eyes: "angry", mouth: "frown", brows: true },
  shocked: { eyes: "big", mouth: "o", brows: true },
  wink: { eyes: "wink", mouth: "smirk" },
  akanbe: { eyes: "akanbe", mouth: "tongue" },
  laugh: { eyes: "arc", mouth: "laugh", blush: true },
  sleepy: { eyes: "closed", mouth: "o" },
  dizzy: { eyes: "spiral", mouth: "wavy" },
  proud: { eyes: "arc", mouth: "smile", blush: true },
};

const BODY_MOTION = {
  idle: {
    y: [0, -5, 0],
    rotate: 0,
    transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
  },
  run: {
    y: [0, -11, 0],
    rotate: [-5, 5, -5],
    transition: { duration: 0.44, repeat: Infinity, ease: "easeInOut" },
  },
  laugh: {
    y: [0, -8, 0],
    rotate: [-7, 7, -7],
    transition: { duration: 0.26, repeat: Infinity, ease: "easeInOut" },
  },
  fallen: {
    y: 30,
    rotate: 84,
    transition: { type: "spring", stiffness: 110, damping: 11, mass: 0.8 },
  },
  float: {
    y: [0, -12, 0],
    rotate: [0, 2, 0],
    transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const ARM_POSE = {
  idle: { l: 0, r: 0 },
  wave: { l: 0, r: [-108, -132, -108] },
  cheer: { l: 108, r: -108 },
  tap: { l: [-14, 6, -14], r: [14, -6, 14] },
  shy: { l: 14, r: -14 },
  belly: { l: 0, r: 0, front: true },
  hold: { l: 0, r: 0, front: true },
};

/* ------------------------------ eyes ------------------------------ */

function Eyes({ kind, px, py }) {
  const open = (cx, cy, big) => (
    <g key={`${cx}-open`}>
      <ellipse
        cx={cx}
        cy={cy}
        rx={big ? 16 : 13}
        ry={big ? 18 : 15}
        fill={WHITE}
      />
      <g transform={`translate(${cx} ${cy})`}>
        <motion.g style={{ x: px, y: py }}>
          <circle cx="0" cy="1" r={big ? 8.6 : 7.6} fill={INK} />
          <circle cx="2.6" cy="-2.4" r="2.5" fill="#fff" />
          <circle cx="-2.4" cy="4" r="1.3" fill="#fff" opacity="0.6" />
        </motion.g>
      </g>
    </g>
  );

  const arc = (cx, cy, up = true) => (
    <path
      key={`${cx}-arc`}
      d={
        up
          ? `M${cx - 12} ${cy + 4} Q${cx} ${cy - 11} ${cx + 12} ${cy + 4}`
          : `M${cx - 12} ${cy - 3} Q${cx} ${cy + 10} ${cx + 12} ${cy - 3}`
      }
      stroke={INK}
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
  );

  const heart = (cx, cy) => (
    <path
      key={`${cx}-heart`}
      d="M0 5C-6-4-16-3-14 4c2 6 14 12 14 12s12-6 14-12c2-7-8-8-14-4Z"
      fill={BLUSH}
      transform={`translate(${cx} ${cy - 5}) scale(0.92)`}
    />
  );

  const half = (cx, cy) => (
    <g key={`${cx}-half`}>
      <path
        d={`M${cx - 14} ${cy - 2} Q${cx} ${cy + 15} ${cx + 14} ${cy - 2} Q${cx} ${cy - 13} ${cx - 14} ${cy - 2} Z`}
        fill={WHITE}
      />
      <g transform={`translate(${cx} ${cy})`}>
        <motion.g style={{ x: px, y: py }}>
          <circle cx="0" cy="4" r="6.4" fill={INK} />
          <circle cx="2" cy="2" r="2" fill="#fff" />
        </motion.g>
      </g>
      <path
        d={`M${cx - 14} ${cy - 1} Q${cx} ${cy + 4} ${cx + 14} ${cy - 1}`}
        stroke={INK}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );

  const angry = (cx, cy) => (
    <g key={`${cx}-angry`}>
      <path
        d={`M${cx - 13} ${cy - 1} Q${cx} ${cy - 9} ${cx + 13} ${cy - 1} Q${cx} ${cy + 8} ${cx - 13} ${cy - 1} Z`}
        fill={WHITE}
      />
      <g transform={`translate(${cx} ${cy})`}>
        <motion.g style={{ x: px, y: py }}>
          <circle cx="0" cy="0" r="5.4" fill={INK} />
        </motion.g>
      </g>
    </g>
  );

  const spiral = (cx, cy) => (
    <path
      key={`${cx}-spiral`}
      d={`M${cx} ${cy}m0 0a3 3 0 1 0 6 0a6 6 0 1 0-12 0a9 9 0 1 0 18 0`}
      stroke={INK}
      strokeWidth="2.6"
      fill="none"
      strokeLinecap="round"
    />
  );

  const akanbe = (cx, cy) => (
    <g key={`${cx}-akanbe`}>
      <ellipse cx={cx} cy={cy} rx={14} ry={16} fill={WHITE} />
      <g transform={`translate(${cx} ${cy})`}>
        <motion.g style={{ x: px, y: py }}>
          <circle cx="0" cy="1" r="8" fill={INK} />
          <circle cx="2.8" cy="-2.6" r="2.6" fill="#fff" />
        </motion.g>
      </g>
      <path
        d={`M${cx - 14} ${cy + 11} Q${cx} ${cy + 30} ${cx + 14} ${cy + 11}`}
        stroke={BLUSH}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${cx - 14} ${cy + 11} Q${cx} ${cy + 30} ${cx + 14} ${cy + 11}`}
        stroke="#be123c"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d={`M${cx - 14} ${cy - 20} L${cx + 9} ${cy - 25}`}
        stroke="#2a1d5e"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </g>
  );

  switch (kind) {
    case "arc":
      return (
        <>
          {arc(74, 96)}
          {arc(126, 96)}
        </>
      );
    case "heart":
      return (
        <>
          {heart(74, 96)}
          {heart(126, 96)}
        </>
      );
    case "closed":
      return (
        <>
          {arc(74, 96, false)}
          {arc(126, 96, false)}
        </>
      );
    case "half":
      return (
        <>
          {half(74, 96)}
          {half(126, 96)}
        </>
      );
    case "angry":
      return (
        <>
          {angry(74, 96)}
          {angry(126, 96)}
        </>
      );
    case "spiral":
      return (
        <>
          {spiral(74, 96)}
          {spiral(126, 96)}
        </>
      );
    case "wink":
      return (
        <>
          {arc(74, 96)}
          {open(126, 96)}
        </>
      );
    case "akanbe":
      return (
        <>
          {open(74, 96)}
          {akanbe(126, 96)}
        </>
      );
    case "big":
      return (
        <>
          {open(74, 96, true)}
          {open(126, 96, true)}
        </>
      );
    default:
      return (
        <>
          {open(74, 96)}
          {open(126, 96)}
        </>
      );
  }
}

/* ------------------------------ mouth ----------------------------- */

function Mouth({ kind }) {
  switch (kind) {
    case "smileBig":
      return (
        <g>
          <path d="M80 122 Q100 154 120 122 Z" fill={INK} />
          <ellipse cx="100" cy="140" rx="7.5" ry="4.5" fill={BLUSH} />
        </g>
      );
    case "open":
      return (
        <g>
          <ellipse cx="100" cy="135" rx="14" ry="16" fill={INK} />
          <ellipse cx="100" cy="144" rx="7.5" ry="4.5" fill={BLUSH} />
        </g>
      );
    case "laugh":
      return (
        <g>
          <path d="M78 120 Q100 170 122 120 Z" fill={INK} />
          <ellipse cx="100" cy="150" rx="9" ry="5.5" fill={BLUSH} />
        </g>
      );
    case "smirk":
      return (
        <path
          d="M86 130 Q100 138 116 123"
          stroke={INK}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "frown":
      return (
        <path
          d="M86 138 Q100 123 114 138"
          stroke={INK}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "o":
      return <ellipse cx="100" cy="134" rx="7.5" ry="8.5" fill={INK} />;
    case "wavy":
      return (
        <path
          d="M86 132 q7 -7 14 0 t14 0"
          stroke={INK}
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "tongue":
      return (
        <g>
          <path
            d="M93 130 q9 4 18 0 q2 20 -9 20 q-11 0 -9 -20 Z"
            fill={BLUSH}
            stroke="#e11d48"
            strokeWidth="1.6"
          />
          <path
            d="M86 126 Q100 140 114 126"
            stroke={INK}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    default:
      return (
        <path
          d="M86 126 Q100 140 114 126"
          stroke={INK}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      );
  }
}

/* ------------------------------- pet ------------------------------ */

export default function Pet({
  expression = "idle",
  action = "idle",
  motionState = "idle",
  lookX,
  lookY,
  size = 104,
  className = "",
  style,
}) {
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const reduced = useReducedMotion();
  const px = lookX || fallbackX;
  const py = lookY || fallbackY;

  const uid = useId().replace(/[:]/g, "");
  const bodyId = `pet-body-${uid}`;
  const armId = `pet-arm-${uid}`;
  const shineId = `pet-shine-${uid}`;

  const exp = EXPRESSIONS[expression] || EXPRESSIONS.idle;
  const pose = ARM_POSE[action] || ARM_POSE.idle;
  const body = reduced
    ? { y: 0, rotate: 0 }
    : BODY_MOTION[motionState] || BODY_MOTION.idle;

  const armTransition = reduced
    ? { duration: 0.3 }
    : action === "wave"
      ? { duration: 0.62, repeat: Infinity, ease: "easeInOut" }
      : action === "tap"
        ? { duration: 0.34, repeat: Infinity, ease: "easeInOut" }
        : { type: "spring", stiffness: 200, damping: 15 };

  return (
    <div
      className={`pet ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <span className="pet-shadow" />
      <motion.div className="pet-body" animate={body}>
        <svg
          className="pet-svg"
          viewBox="0 0 200 200"
          role="presentation"
          focusable="false"
        >
          <defs>
            <linearGradient id={bodyId} x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#d8ccff" />
              <stop offset="34%" stopColor="#9b7bff" />
              <stop offset="72%" stopColor="#7050f0" />
              <stop offset="100%" stopColor="#4b34c9" />
            </linearGradient>
            <linearGradient id={armId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d3c6ff" />
              <stop offset="100%" stopColor="#7f60f2" />
            </linearGradient>
            <radialGradient id={shineId} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* feet */}
          <ellipse cx="72" cy="181" rx="15" ry="8.5" fill="#4a34bd" />
          <ellipse cx="128" cy="181" rx="15" ry="8.5" fill="#4a34bd" />

          {/* body */}
          <path
            d="M100 18C148 18 184 50 184 100C184 152 150 184 100 184C50 184 16 152 16 100C16 50 52 18 100 18Z"
            fill={`url(#${bodyId})`}
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.5"
          />

          {/* gloss */}
          <ellipse
            cx="72"
            cy="56"
            rx="34"
            ry="22"
            fill={`url(#${shineId})`}
            transform="rotate(-24 72 56)"
          />
          <ellipse
            cx="100"
            cy="158"
            rx="44"
            ry="18"
            fill="#2b1d80"
            opacity="0.16"
          />

          {/* antenna */}
          <path
            d="M100 20 C100 10 104 6 108 4"
            stroke="#c4b5fd"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="109" cy="3" r="9" fill="#22d3ee" opacity="0.22" />
          <circle cx="109" cy="3" r="5" fill="#67e8f9" />

          {/* arms — in front, always visible */}
          {!pose.front && (
            <>
              <motion.g
                animate={{ rotate: pose.l }}
                transition={armTransition}
                style={{
                  transformBox: "view-box",
                  originX: "29%",
                  originY: "64%",
                }}
              >
                <path
                  d="M58 128 C42 138 33 148 31 158"
                  stroke={`url(#${armId})`}
                  strokeWidth="13"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="31" cy="160" r="9.5" fill={`url(#${armId})`} />
                <circle cx="28" cy="157" r="3.2" fill="#fff" opacity="0.4" />
              </motion.g>
              <motion.g
                animate={{ rotate: pose.r }}
                transition={armTransition}
                style={{
                  transformBox: "view-box",
                  originX: "71%",
                  originY: "64%",
                }}
              >
                <path
                  d="M142 128 C158 138 167 148 169 158"
                  stroke={`url(#${armId})`}
                  strokeWidth="13"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="169" cy="160" r="9.5" fill={`url(#${armId})`} />
                <circle cx="166" cy="157" r="3.2" fill="#fff" opacity="0.4" />
              </motion.g>
            </>
          )}

          {/* blush */}
          {exp.blush && (
            <>
              <ellipse
                cx="56"
                cy="120"
                rx="11"
                ry="6"
                fill={BLUSH}
                opacity="0.4"
              />
              <ellipse
                cx="144"
                cy="120"
                rx="11"
                ry="6"
                fill={BLUSH}
                opacity="0.4"
              />
            </>
          )}

          {/* brows */}
          {exp.brows && (
            <>
              <path
                d="M60 76 L88 82"
                stroke="#2a1d5e"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M140 76 L112 82"
                stroke="#2a1d5e"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* eyes */}
          <motion.g
            animate={exp.blink ? { scaleY: [1, 1, 0.06, 1] } : { scaleY: 1 }}
            transition={
              exp.blink
                ? {
                    duration: 0.36,
                    times: [0, 0.84, 0.92, 1],
                    repeat: Infinity,
                    repeatDelay: 4.4,
                    ease: "easeInOut",
                  }
                : { duration: 0.2 }
            }
            style={{
              transformBox: "view-box",
              transformOrigin: "100px 96px",
            }}
          >
            <Eyes kind={exp.eyes} px={px} py={py} />
          </motion.g>

          {/* mouth */}
          <Mouth kind={exp.mouth} />

          {/* arms — in front (cuddle / belly laugh) */}
          {pose.front && (
            <>
              <path
                d="M50 136 C60 164 80 172 94 161"
                stroke={`url(#${armId})`}
                strokeWidth="13"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="94" cy="161" r="9.5" fill={`url(#${armId})`} />
              <circle cx="92" cy="158" r="3.2" fill="#fff" opacity="0.4" />
              <path
                d="M150 136 C140 164 120 172 106 161"
                stroke={`url(#${armId})`}
                strokeWidth="13"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="106" cy="161" r="9.5" fill={`url(#${armId})`} />
              <circle cx="104" cy="158" r="3.2" fill="#fff" opacity="0.4" />
            </>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
