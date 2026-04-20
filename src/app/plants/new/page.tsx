import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PlantForm } from "@/components/PlantForm";

export default function NewPlantPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/plants"
          aria-label="Retour"
          className="inline-flex items-center text-violet-700 dark:text-violet-300"
        >
          <ChevronLeft size={24} strokeWidth={1.8} />
        </Link>
        <h1 className="text-2xl font-bold">Nouvelle plante</h1>
      </div>
      <PlantForm mode="create" />
    </div>
  );
}
