import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import { safeUrl } from "../media";
import { EASE, Magnetic, Reveal, SectionLabel, SplitText } from "./ui";

export default function Contact({ profile }) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const socials = [
    { href: safeUrl(profile.github), label: "GitHub", Icon: Github },
    { href: safeUrl(profile.linkedin), label: "LinkedIn", Icon: Linkedin },
  ].filter((item) => item.href);

  return (
    <section id="contact" className="section contact-section">
      <span className="contact-orb contact-orb-a" aria-hidden="true" />
      <span className="contact-orb contact-orb-b" aria-hidden="true" />
      <span className="contact-grid" aria-hidden="true" />

      <div className="shell contact-shell">
        <Reveal>
          <div className="contact-top">
            <SectionLabel index="04">
              Your idea. Our next conversation.
            </SectionLabel>
            <span className="chip">
              <i className="status-dot" />
              {profile.availability}
            </span>
          </div>
        </Reveal>

        <h2 className="contact-title">
          <SplitText text="Good things" className="contact-line" delay={0.05} />
          <SplitText
            text="start with hello."
            className="contact-line"
            delay={0.2}
          />
        </h2>

        <Reveal delay={0.1} className="contact-body">
          <div className="contact-left">
            <p>
              Whether it’s a role, a collaboration or an idea that needs a
              second pair of hands — I’d love to hear about it.
            </p>
            <div className="email-row">
              <Magnetic strength={0.14}>
                <a
                  className="email-link"
                  href={`mailto:${profile.email}`}
                  data-cursor="Write to me"
                >
                  <Mail size={20} />
                  <span className="email-text">
                    {profile.email.split("").map((char, i) => (
                      <em key={i} style={{ "--i": i }}>
                        {char}
                      </em>
                    ))}
                  </span>
                  <ArrowUpRight size={20} />
                </a>
              </Magnetic>
              <button
                type="button"
                className="icon-btn copy-btn"
                onClick={copyEmail}
                aria-label="Copy email address"
                data-cursor={copied ? "Copied" : "Copy"}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <AnimatePresence>
                {copied && (
                  <motion.span
                    className="copy-toast"
                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.32, ease: EASE }}
                    role="status"
                  >
                    Email copied
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="contact-right">
            <span className="eyebrow">Elsewhere</span>
            <div className="social-list">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  className="social-link"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor={label}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  <ArrowUpRight size={15} />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
