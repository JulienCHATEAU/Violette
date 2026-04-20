"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
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
        return;
      }
      router.push("/");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xs space-y-3">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">Utilisateur</label>
        <input
          id="username"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">Mot de passe</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-zinc-900"
        />
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-3 disabled:opacity-60 shadow-soft transition"
      >
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
