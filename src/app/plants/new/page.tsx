import Link from "next/link";
import { PlantForm } from "@/components/PlantForm";

export default function NewPlantPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/plants" aria-label="Retour" className="text-xl">‹</Link>
        <h1 className="text-2xl font-bold">Nouvelle plante</h1>
      </div>
      <PlantForm mode="create" />
    </div>
  );
}
