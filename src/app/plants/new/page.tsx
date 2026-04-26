import { redirect } from "next/navigation";
import { PlantWizard } from "@/components/PlantWizard";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * New plant — two-step onboarding wizard.
 *
 * The page is a thin server shell: it just guards the session and mounts the
 * client `<PlantWizard>` which owns the entire flow (state, navigation,
 * sticky CTA, animated step transitions).
 */
export default async function NewPlantPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <PlantWizard />;
}
