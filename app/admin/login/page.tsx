import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-2xl font-bold">Painel administrativo</h1>
      <p className="mb-8 text-sm text-muted">Acesso restrito à equipe Zvizzer.</p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
