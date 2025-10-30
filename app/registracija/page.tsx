"use client";
import { useState } from "react";

export default function RegistracijaPage() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    phone: ""
  });
  const [msg, setMsg] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) setMsg(`Ustvarjen uporabnik: ${data.user.email}`);
    else setMsg(`Napaka: ${data.error || "Neznana napaka"}`);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-extrabold">Registracija</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4 text-left">
          <input type="email" placeholder="E-pošta" value={form.email} onChange={(e)=>update("email", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" required />
          <input type="text" placeholder="Uporabniško ime" value={form.username} onChange={(e)=>update("username", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" required />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Ime" value={form.first_name} onChange={(e)=>update("first_name", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" required />
            <input type="text" placeholder="Priimek" value={form.last_name} onChange={(e)=>update("last_name", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" required />
          </div>
          <input type="text" placeholder="Telefon (opcijsko)" value={form.phone} onChange={(e)=>update("phone", e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
          <button className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">Ustvari račun</button>
        </form>
        {msg && <p className="mt-4 text-sm">{msg}</p>}
      </div>
    </main>
  );
}
