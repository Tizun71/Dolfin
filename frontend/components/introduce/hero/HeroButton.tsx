import { CSSProperties } from "react";

interface Props {
  onClick: () => void;
  style?: CSSProperties;
}

export default function HeroButton({ onClick, style }: Props) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group border border-yellow-400 px-16 py-5 text-xs font-mono uppercase tracking-[4px] text-yellow-400 relative overflow-hidden transition-all duration-500 hover:text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)]"
    >
      <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
      <span className="relative z-10">Launch App →</span>
    </button>
  );
}
