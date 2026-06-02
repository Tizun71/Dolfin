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
      className="group border border-white px-16 py-5 text-xs font-mono uppercase tracking-[4px] text-white relative overflow-hidden transition-colors duration-500 hover:text-black"
    >
      <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
      <span className="relative z-10">Launch App →</span>
    </button>
  );
}
