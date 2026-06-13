import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LogoDolfin from "@/components/shared/LogoDolfin";
import Footer from "@/components/introduce/footer/Footer";

export type LegalSection = {
  heading: string;
  body: string[];
};

type Props = {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export default function LegalDocument({ title, updated, intro, sections }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <LogoDolfin size={32} />
            <span className="text-brand-gradient text-lg font-mono font-semibold uppercase tracking-tight">
              Dolfin
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-yellow-400 transition-colors duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-yellow-400/80 text-[11px] font-mono font-semibold uppercase tracking-[0.22em] mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-mono font-semibold uppercase tracking-tight text-brand-gradient mb-3">
            {title}
          </h1>
          <p className="text-sm text-neutral-500 font-mono mb-10">
            Last updated {updated}
          </p>

          <p className="text-base text-neutral-300 leading-relaxed text-pretty mb-12">
            {intro}
          </p>

          <div className="flex flex-col gap-10">
            {sections.map((section, i) => (
              <section key={section.heading}>
                <h2 className="flex items-baseline gap-3 text-lg font-mono font-semibold uppercase tracking-tight text-white mb-4">
                  <span className="text-yellow-400/60 text-sm tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                <div className="flex flex-col gap-3 pl-9">
                  {section.body.map((para, j) => (
                    <p
                      key={j}
                      className="text-[15px] text-neutral-400 leading-relaxed text-pretty"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
