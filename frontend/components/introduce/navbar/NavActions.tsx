import { useRouter } from "next/navigation";

export default function NavActions() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
          Live
        </span>
      </div>
      <button
        onClick={() => router.push("/dashboard")}
        className="bg-white text-black text-sm font-medium uppercase tracking-wide px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200"
      >
        Launch App
      </button>
    </div>
  );
}
