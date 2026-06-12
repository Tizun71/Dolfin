// Plain pulse skeleton block. Compose with width/height/rounded utilities via className.
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1a1a1a] rounded ${className}`} />;
}
