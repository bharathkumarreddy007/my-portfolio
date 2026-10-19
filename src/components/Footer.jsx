import React from "react";
import { motion } from "framer-motion";
import { ArrowUp, Github, Linkedin, Mail } from "lucide-react";
import { safeUrl } from "../media";
import { EASE } from "./ui";

export default function Footer({ profile }) {
  const socials = [
    { href: safeUrl(profile.github), label: "GitHub", Icon: Github },
    { href: safeUrl(profile.linkedin), label: "LinkedIn", Icon: Linkedin },
    { href: `mailto:${profile.email}`, label: "Email", Icon: Mail },
  ].filter((item) => item.href);

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="wordmark-glyph" aria-hidden="true">
              <span />
            </span>
            <p>
              {profile.role}
              <br />
              {profile.location}
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer">
            {[
              ["Work", "#work"],
              ["About", "#about"],
              ["Résumé", "#resume"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a key={label} href={href} data-cursor="">
                {label}
              </a>
            ))}
          </nav>

          <div className="footer-social">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={label}
                data-cursor={label}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-mega" aria-hidden="true">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            {(profile.shortName || "Portfolio").toUpperCase()}
          </motion.span>
        </div>

        <div className="footer-base">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>Designed & built with curiosity.</span>
          <a href="#home" data-cursor="Top">
            Back to top
            <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
