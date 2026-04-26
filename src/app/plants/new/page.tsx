import Link from "next/link";
import { PlantForm } from "@/components/PlantForm";
import { H1, Italic } from "@/design-system/components/Typography";
import { ArrowLeft } from "@/design-system/icons";

/**
 * New plant — onboarding form.
 *
 * Laws of UX:
 *  - Peak-End Rule (lite): the personified subtitle frames the form as an act of
 *    care, not a CRUD task.
 *  - Fitts's Law: the back button is a 44px round target in the top-left corner.
 */
export default function NewPlantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/plants"
          aria-label="Retour à la liste"
          className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-paper-50 border border-paper-200 text-ink-600 shadow-paper hover:bg-paper-100 transition-colors duration-180 ease-organic focus:outline-none focus-visible:ring-4 focus-visible:ring-terracotta-500/20"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <H1 className="text-3xl">Nouvelle plante</H1>
          <p className="font-serif italic text-ink-600 text-base">
            <Italic className="text-ink-600">Présente-moi ta nouvelle protégée.</Italic>
          </p>
        </div>
      </div>
      <PlantForm mode="create" />
    </div>
  );
}
