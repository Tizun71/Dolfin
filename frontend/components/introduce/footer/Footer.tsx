"use client";

import Link from "next/link";
import { FOOTER_LINKS, SOCIAL_LINKS } from "./constants";
import { ExternalLink, MessageCircle } from "lucide-react";
import LogoDolfin from "@/components/shared/LogoDolfin";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#1a1a1a] bg-[#0e0e0e] relative z-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 group">
                <LogoDolfin size={40} />
                <h3 className="text-brand-gradient text-3xl font-bold uppercase tracking-[0.25em]">
                  Dolfin
                </h3>
              </div>
              <p className="text-base text-[#ddd] font-light leading-relaxed max-w-sm">
                Autonomous DeFi Intelligence. AI-powered trading agents that
                optimize your yield across every chain.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-4 mt-2">
                {SOCIAL_LINKS.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#444] bg-[#0a0a0a] text-[#bbb] transition-all duration-300 hover:border-yellow-500/60 hover:text-yellow-400 hover:bg-[#111] hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    aria-label={social.name}
                  >
                    {social.icon === "github" && (
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    )}
                    {social.icon === "discord" && <MessageCircle className="h-5 w-5" />}
                    {social.icon === "twitter" && (
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-mono uppercase tracking-[3px] text-yellow-300 mb-5">
              Product
            </h4>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-[#ccc] hover:text-white transition-colors duration-200 font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-sm font-mono uppercase tracking-[3px] text-yellow-300 mb-5">
              Resources
            </h4>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-[15px] text-[#ccc] hover:text-white transition-colors duration-200 font-light inline-flex items-center gap-1.5"
                  >
                    {link.name}
                    {link.href.startsWith("http") && (
                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-mono uppercase tracking-[3px] text-yellow-300 mb-5">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-[#ccc] hover:text-white transition-colors duration-200 font-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#aaa] tracking-[0.15em] font-mono">
              © 2026 Dolfin Protocol. All rights reserved.
            </span>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            <span className="text-sm text-[#aaa] font-mono uppercase tracking-[2px]">
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
