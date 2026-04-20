import { redirect } from "next/navigation";
import { Flower2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 text-violet-700">
          <Flower2 size={36} strokeWidth={1.6} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-violet-700">Violette</h1>
        <p className="text-sm text-zinc-500">Connecte-toi pour voir tes plantes.</p>
      </div>
      <LoginForm />
    </div>
  );
}
