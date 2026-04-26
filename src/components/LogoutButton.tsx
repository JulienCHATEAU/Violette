"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/design-system/components/Button";
import { LogOut } from "@/design-system/icons";

export function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const onClick = () =>
    start(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={pending}
      leadingIcon={<LogOut size={16} />}
      className="!text-terracotta-600 hover:!bg-terracotta-50"
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </Button>
  );
}
