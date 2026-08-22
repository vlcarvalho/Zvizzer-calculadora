"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error ?? "Não foi possível entrar.");
      setEnviando(false);
      return;
    }

    const next = searchParams.get("next") ?? "/admin";
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="E-mail">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface px-5 py-3.5 text-base text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </Field>
      <Field label="Senha">
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-2xl border border-border bg-surface px-5 py-3.5 text-base text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </Field>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <Button type="submit" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
