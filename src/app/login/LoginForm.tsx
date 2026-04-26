"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/design-system/components/Card";
import { TextInput } from "@/design-system/components/Input";
import { Button } from "@/design-system/components/Button";
import { Label } from "@/design-system/components/Typography";

/**
 * LoginForm — credentials submission.
 *
 * Laws of UX:
 *  - Fitts's Law: full-width CTA at size lg (56px) within thumb reach.
 *  - Law of Common Region: card frames the form so the field group reads as a unit.
 *  - Doherty Threshold: useTransition gives instant visual feedback (<100ms perceived).
 *
 * The animation token used on error is intentionally short (~320ms) so the form
 * stays usable; honors `prefers-reduced-motion` via framer-motion's hook.
 */
export function LoginForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorSeq, setErrorSeq] = useState(0);
  const prefersReduced = useReducedMotion();

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });
      if (!res.ok) {
        setError("Identifiants incorrects.");
        setErrorSeq((n) => n + 1);
        return;
      }
      router.push("/");
      router.refresh();
    });
  };

  const shake = prefersReduced ? undefined : { x: [0, -6, 6, -4, 4, 0] };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-xs"
    >
      <motion.div animate={errorSeq > 0 ? shake : undefined} transition={{ duration: 0.32 }} key={errorSeq}>
        <Card radius="organic-1" elevation="paper" padding="lg" textured>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="block">
                <Label>Utilisateur</Label>
              </label>
              <TextInput
                id="username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ton prénom"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block">
                <Label>Mot de passe</Label>
              </label>
              <TextInput
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error ? (
              <p className="font-sans text-sm text-terracotta-600" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="cta" size="lg" disabled={pending} className="w-full">
              {pending ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
