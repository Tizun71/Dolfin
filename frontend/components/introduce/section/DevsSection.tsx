"use client";

export default function DevsSection() {
  const items = [
    {
      icon: "🔒",
      title: "Security",
      desc: "Find and report vulnerabilities, receive generous rewards.",
      href: "#",
    },
    {
      icon: "💻",
      title: "SDK",
      desc: "Utilize our SDK to streamline frontend development and enhance user experiences.",
      href: "#",
    },
    {
      icon: "🐙",
      title: "Github",
      desc: "Explore our open-source repository for collaborative development.",
      href: "#",
    },
    {
      icon: "📄",
      title: "Developer Docs",
      desc: "Access comprehensive documentation for seamless API integration.",
      href: "#",
    },
  ];

  return (
    <section
      id="devs"
      className="relative z-10 px-16 py-32 border-t border-[#111]"
    >
      <p className="text-[#444] text-xs font-mono uppercase tracking-[4px] mb-6 text-center">
        Developers & Security
      </p>
      <h2 className="text-4xl font-light uppercase tracking-[0.1em] text-white text-center mb-4">
        Build on Dolfin
      </h2>
      <p className="text-[#555] text-sm font-mono text-center max-w-md mx-auto mb-16 leading-relaxed">
        Dolfin provides the intelligence layer which empowers developers to
        build the financial apps of tomorrow.
      </p>

      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="flex items-center gap-6 border border-[#1a1a1a] p-6 hover:border-[#333] transition-all duration-300 group"
          >
            <span className="text-2xl w-10 text-center">{item.icon}</span>
            <div>
              <p className="text-white text-sm font-mono uppercase tracking-[2px] mb-1">
                {item.title}
              </p>
              <p className="text-[#444] text-xs font-mono leading-relaxed">
                {item.desc}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
