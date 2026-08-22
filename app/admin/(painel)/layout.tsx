import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminPainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AdminNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
