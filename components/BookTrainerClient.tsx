"use client";
import { useState } from "react";

export default function BookTrainerClient({ trainerId, slots }: { trainerId: string | null; slots: { iso: string; label: string }[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function book() {
    if (!trainerId || !selected) {
      setMsg("Izberi trenerja in termin.");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/pt/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId, startAtIso: selected })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Napaka pri rezervaciji");
      setMsg("Rezervacija shranjena.");
    } catch (e: any) {
      setMsg(e.message || "Napaka");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mt-2 flex flex-wrap gap-2">
        {slots.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(s.iso || s.label)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 ${selected === (s.iso || s.label) ? "border-gray-900" : "border-gray-300"}`}
            disabled={loading}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={book}
          disabled={loading || !trainerId || !selected}
          className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          Rezerviraj
        </button>
        {msg && <span className="ml-3 text-sm text-gray-700">{msg}</span>}
      </div>
    </div>
  );
}
