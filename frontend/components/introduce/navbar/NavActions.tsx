import { useRouter } from "next/navigation";

export default function NavActions() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/dashboard")}
      className="px-6 py-3 text-xs uppercase tracking-[3px] font-mono btn-brand transition disabled:opacity-50"
    >
      Launch App
    </button>
  );
}
