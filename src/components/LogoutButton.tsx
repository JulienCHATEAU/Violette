"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const onClick = () =>
    start(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 px-4 py-2 text-sm font-medium disabled:opacity-60 transition"
    >
      <LogOut size={16} strokeWidth={2} />
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
