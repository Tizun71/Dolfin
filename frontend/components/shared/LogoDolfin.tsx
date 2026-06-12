import Image from "next/image";

export default function LogoDolfin({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/dolfin-logo-no-bg.png"
      alt="Dolfin"
      width={size}
      height={size}
      priority
      className={`transition-transform duration-300 group-hover:rotate-12 ${className}`}
    />
  );
}
