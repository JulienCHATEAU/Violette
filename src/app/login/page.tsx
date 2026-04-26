import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Leaf } from "@/design-system/icons";
import { H1, Italic } from "@/design-system/components/Typography";
import { BotanicalLeaf } from "@/design-system/decorations/BotanicalLeaf";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

/**
 * Login screen — entry point for unauthenticated users.
 *
 * Laws of UX:
 *  - Aesthetic-Usability Effect: paper background, organic logo halo, Fraunces voice,
 *    BotanicalLeaf decorations on either side to anchor the herbarium identity.
 *  - Peak-End Rule (lite): the personified subtitle establishes the app's tone before
 *    the user even reaches the dashboard.
 *
 * Visual escape from the root <main> wrapper: negative margins extend the paper
 * background to the full viewport, overriding the body's `--bg` for this screen only.
 * `colorScheme: light` prevents the OS dark-mode preference from inverting our palette.
 */
export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div
      className="relative -mx-6 sm:-mx-8 -mt-8 -mb-32 px-6 sm:px-8 pt-12 pb-32 min-h-screen bg-paper-50 paper-grain flex flex-col items-center justify-center gap-8 overflow-hidden"
      style={{ colorScheme: "light" }}
    >
      {/* Decorative botanical accents */}
      <BotanicalLeaf
        size={200}
        className="absolute -top-12 -left-16 text-moss-500 opacity-25 rotate-[-18deg]"
      />
      <BotanicalLeaf
        size={180}
        className="absolute -bottom-8 -right-14 text-terracotta-500 opacity-20 rotate-[24deg]"
      />

      <header className="relative text-center space-y-4">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-organic-2 bg-terracotta-50 border border-terracotta-200 shadow-paper text-terracotta-500"
          aria-hidden="true"
        >
          <Leaf size={36} />
        </div>
        <H1 className="text-ink-800">Violette</H1>
        <p className="font-serif italic text-ink-600 text-base">
          <Italic className="text-ink-600">Tes plantes t&apos;attendent.</Italic>
        </p>
        <div className="filet-h mx-auto w-32" />
      </header>

      <div className="relative w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
