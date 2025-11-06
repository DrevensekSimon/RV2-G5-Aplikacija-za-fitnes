"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PrijavaPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Prijava uspešna (demo): ${data.message}`);
      router.push("/moj-profil");
      return;
    }
    else setMsg(`Napaka: ${data.error || "Neznana napaka"}`);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-extrabold">Prijava</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input type="email" placeholder="E-pošta" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" required />
          <input type="password" placeholder="Geslo (demo)" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
          <button className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">Prijava</button>
        </form>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </main>
  );
}
