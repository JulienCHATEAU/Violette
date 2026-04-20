import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, ChevronLeft, Info, Smartphone, User } from "lucide-react";
import { NotificationPermission } from "@/components/NotificationPermission";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="Retour"
          className="inline-flex items-center text-violet-700 dark:text-violet-300"
        >
          <ChevronLeft size={24} strokeWidth={1.8} />
        </Link>
        <h1 className="text-2xl font-bold">Réglages</h1>
      </div>

      <section className="rounded-2xl border border-sage-100 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold text-sage-700">
          <User size={18} strokeWidth={2} />
          Compte
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Connecté en tant que <span className="font-mono text-violet-700">{session.username}</span>.
        </p>
        <LogoutButton />
      </section>

      <section className="rounded-2xl border border-sage-100 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold text-sage-700">
          <Bell size={18} strokeWidth={2} />
          Notifications
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Active les notifications pour recevoir les petits messages de tes plantes.
        </p>
        <NotificationPermission />
      </section>

      <section className="rounded-2xl border border-sage-100 bg-white dark:bg-zinc-900 p-5 space-y-2 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold text-sage-700">
          <Smartphone size={18} strokeWidth={2} />
          Installer Violette
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Sur iOS : ouvre dans Safari → Partager → « Ajouter à l'écran d'accueil ».<br />
          Sur Android/Chrome : menu → « Installer l'application ».
        </p>
      </section>

      <section className="rounded-2xl border border-sage-100 bg-white dark:bg-zinc-900 p-5 space-y-2 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold text-sage-700">
          <Info size={18} strokeWidth={2} />
          À propos
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Violette — mes plantes m'écrivent. v0.3.0
        </p>
      </section>
    </div>
  );
}
