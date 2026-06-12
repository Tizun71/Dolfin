import { useRouter } from "next/navigation";

export default function NavActions() {
  const router = useRouter();

  return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-gray-400 text-xs font-mono font-semibold uppercase tracking-tight">
            Live
          </span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-white text-black text-sm font-mono font-semibold uppercase tracking-tight px-5 py-2.5 rounded-lg hover:bg-yellow-400 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-yellow-400/20"
        >
          Launch App
        </button>
      </div>
  );
}
