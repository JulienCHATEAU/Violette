import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationPermission } from "@/components/NotificationPermission";
import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/auth/session";
import { Card } from "@/design-system/components/Card";
import { H1, H3, Body, Italic } from "@/design-system/components/Typography";
import { ArrowLeft, Bell, Info, Smartphone, User } from "@/design-system/icons";

export const dynamic = "force-dynamic";

/**
 * Settings — account, push notifications, install hints, app info.
 *
 * Laws of UX:
 *  - Hick's Law: only four sections, each with a clear icon and a single concern.
 *  - Law of Common Region: each section is its own organic Card.
 *  - Law of Proximity: icon + heading + helper text + action stack tightly.
 *  - Aesthetic-Usability Effect: paper palette, organic radii, Fraunces voice.
 */
export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-paper-50 border border-paper-200 text-ink-600 shadow-paper hover:bg-paper-100 transition-colors duration-180 ease-organic focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <H1 className="text-3xl">Réglages</H1>
          <p className="font-serif italic text-ink-600 text-base">
            <Italic className="text-ink-600">Quelques réglages discrets.</Italic>
          </p>
        </div>
      </div>

      <SettingsSection icon={<User size={18} className="text-moss-500" />} title="Compte">
        <Body className="text-sm text-ink-600">
          Connecté en tant que{" "}
          <span className="font-mono text-ink-800 font-medium">{session.username}</span>.
        </Body>
        <LogoutButton />
      </SettingsSection>

      <SettingsSection icon={<Bell size={18} className="text-terracotta-500" />} title="Notifications">
        <Body className="text-sm text-ink-600">
          Active les notifications pour recevoir les petits messages de tes plantes.
        </Body>
        <NotificationPermission />
      </SettingsSection>

      <SettingsSection icon={<Smartphone size={18} className="text-ink-600" />} title="Installer Violette">
        <Body className="text-sm text-ink-600">
          Sur iOS : ouvre dans Safari → Partager → « Ajouter à l&apos;écran d&apos;accueil ».
          <br />
          Sur Android/Chrome : menu → « Installer l&apos;application ».
        </Body>
      </SettingsSection>

      <SettingsSection icon={<Info size={18} className="text-ink-600" />} title="À propos">
        <Body className="text-sm text-ink-600">Violette — mes plantes m&apos;écrivent. v0.3.0</Body>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card radius="organic-2" elevation="paper" padding="lg" className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <H3>{title}</H3>
      </div>
      {children}
    </Card>
  );
}
