import React from "react";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { mediaUrl } from "../media";
import { EASE } from "./ui";

/* Hand-built project artwork — no stock imagery, no external requests.
 * Swap in a real cover by setting `cover: "media/your-image.webp"`. */

export default function ProjectArt({ project, detailed = false }) {
  const cover = mediaUrl(project.cover);
  if (cover) {
    return (
      <img
        className="art-cover"
        src={cover}
        alt={`${project.title} cover`}
        loading={detailed ? "eager" : "lazy"}
      />
    );
  }

  if (project.visual === "terminal") {
    return (
      <div className="art art-terminal">
        <div className="art-window">
          <div className="art-window-bar">
            <i />
            <i />
            <i />
            <span>secure-query.java</span>
          </div>
          <div className="art-code">
            <p>
              <b>public class</b> SecureQuery {"{"}
            </p>
            <p>
              &nbsp;&nbsp;<b>private</b> String seal(byte[] row);
            </p>
            <p>
              &nbsp;&nbsp;<em>// readable to you. not to everyone.</em>
            </p>
            <p>
              &nbsp;&nbsp;<b>return</b> query(encrypted);
            </p>
            <p>{"}"}</p>
          </div>
          <div className="art-window-foot">
            <i className="status-dot" />
            CONNECTION ENCRYPTED
          </div>
        </div>
        <span className="art-orbit" />
      </div>
    );
  }

  if (project.visual === "chart") {
    return (
      <div className="art art-chart">
        <div className="art-panel">
          <div className="art-panel-head">
            <span>REVENUE / OVERVIEW</span>
            <b>+38.2%</b>
          </div>
          <svg
            viewBox="0 0 320 130"
            preserveAspectRatio="none"
            role="presentation"
          >
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.5)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </linearGradient>
            </defs>
            <path
              d="M0 108 L36 92 L72 98 L108 70 L144 78 L180 48 L216 56 L252 26 L288 34 L320 12 L320 130 L0 130 Z"
              fill="url(#areaFill)"
            />
            <motion.path
              d="M0 108 L36 92 L72 98 L108 70 L144 78 L180 48 L216 56 L252 26 L288 34 L320 12"
              fill="none"
              stroke="#67e8f9"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.6, ease: EASE }}
            />
          </svg>
          <div className="art-bars">
            {[34, 52, 41, 68, 58, 82, 71, 96].map((height, i) => (
              <motion.i
                key={i}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.05 * i }}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="art art-movies">
      <div className="art-ticket art-ticket-back">
        <span>WATCH NEXT</span>
      </div>
      <div className="art-ticket">
        <span className="art-ticket-orbit" />
        <b>
          THE NEXT
          <br />
          GREAT STORY.
        </b>
        <em>
          <Sparkles size={15} /> CURATED FOR YOU
        </em>
      </div>
      <div className="art-ticket art-ticket-front">
        <Play size={17} fill="currentColor" />
        <span>98% MATCH</span>
      </div>
    </div>
  );
}
