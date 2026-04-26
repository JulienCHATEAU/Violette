import { redirect } from "next/navigation";
import { NotificationPermission } from "@/components/NotificationPermission";
import { getSession } from "@/lib/auth/session";
import { Card } from "@/design-system/components/Card";
import { H1, H3, Body, Italic } from "@/design-system/components/Typography";
import { BotanicalLeaf } from "@/design-system/decorations/BotanicalLeaf";
import { Bell } from "@/design-system/icons";

export const dynamic = "force-dynamic";

/**
 * Notifications — dedicated screen for push permissions and (later) message history.
 *
 * Laws of UX:
 *  - Hick's Law: a single section here so the permission state is unambiguous.
 *  - Aesthetic-Usability Effect: warm copy, organic Card, botanical accent.
 */
export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <header className="relative">
        <BotanicalLeaf
          size={110}
          className="absolute -top-2 -right-3 text-terracotta-500 opacity-25 z-0"
        />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[.2em] text-ink-400 font-semibold">Petits messages</p>
          <H1 className="mt-1 text-3xl">Notifications</H1>
          <p className="mt-1.5 font-serif italic text-ink-600 text-base">
            <Italic className="text-ink-600">Donne une voix à tes plantes.</Italic>
          </p>
        </div>
      </header>

      <div className="filet-h" />

      <Card radius="organic-2" elevation="paper" padding="lg" className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-terracotta-500" />
          <H3>Permissions push</H3>
        </div>
        <Body className="text-sm text-ink-600">
          Active les notifications pour recevoir les petits messages de tes plantes au bon moment.
        </Body>
        <NotificationPermission />
      </Card>
    </div>
  );
}
