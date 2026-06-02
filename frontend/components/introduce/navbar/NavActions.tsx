import { useRouter } from "next/navigation";

export default function NavActions() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        <span className="text-[#888] text-xs font-mono uppercase tracking-[2px]">
          System Active
        </span>
      </div>
      <button
        onClick={() => router.push("/dashboard")}
        className="bg-white text-black text-xs font-mono uppercase tracking-[3px] px-6 py-2.5 rounded-xl hover:bg-[#e0e0e0] transition-all duration-300"
      >
        Launch App
      </button>
    </div>
  );
}
