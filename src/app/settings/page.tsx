import Link from "next/link";
import { NotificationPermission } from "@/components/NotificationPermission";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" aria-label="Retour" className="text-xl">‹</Link>
        <h1 className="text-2xl font-bold">Réglages</h1>
      </div>

      <section className="rounded-2xl border bg-white dark:bg-zinc-900 p-4 space-y-3">
        <h2 className="font-semibold">🔔 Notifications</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Active les notifications pour recevoir les petits messages de tes plantes (arrosage dû, coucous
          aléatoires).
        </p>
        <NotificationPermission />
      </section>

      <section className="rounded-2xl border bg-white dark:bg-zinc-900 p-4 space-y-2">
        <h2 className="font-semibold">📱 Installer Violette</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Sur iOS : ouvre ce site dans Safari → bouton Partager → « Ajouter à l'écran d'accueil ».<br />
          Sur Android/Chrome : ouvre le menu → « Installer l'application ».
        </p>
      </section>

      <section className="rounded-2xl border bg-white dark:bg-zinc-900 p-4 space-y-2">
        <h2 className="font-semibold">ℹ️ À propos</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Violette — mes plantes m'écrivent 🌿. v0.1.0
        </p>
      </section>
    </div>
  );
}
