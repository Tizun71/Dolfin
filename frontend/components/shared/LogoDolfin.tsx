import Image from "next/image";
import DolfinImg from "./Dolfin.png";

export default function LogoDolfin() {
  return (
    <Image
      src={DolfinImg}
      alt="Dolfin"
      width={40}
      height={40}
      className="transition-transform duration-300 group-hover:rotate-12"
    />
  );
}
