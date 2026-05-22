"use client";

const FOOTER_LINKS = ["GITHUB", "DISCORD", "SECURITY", "STATUS"];

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        borderTop: "1px solid #1a1a1a",
        background: "#0e0e0e",
        position: "relative",
        zIndex: 20,
      }}
    >
      <div
        style={{
          padding: "32px 24px",
          display: "flex",
          flexWrap: "wrap" as const,
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              textTransform: "uppercase" as const,
              letterSpacing: "0.2em",
            }}
          >
            DOLFIN
          </span>
          <span
            style={{ fontSize: 13, color: "#999", letterSpacing: "0.15em" }}
          >
            © 2024 DOLFIN PROTOCOL. TERMINAL v1.0.4 — LATENCY: 24MS
          </span>
        </div>

        <div style={{ display: "flex", gap: 32 }}>
          {FOOTER_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              style={{
                color: "#999",
                fontSize: 13,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                (e.currentTarget.style.color = "#fff")
              }
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                (e.currentTarget.style.color = "#999")
              }
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
