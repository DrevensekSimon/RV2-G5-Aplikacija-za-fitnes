"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string; // 'monthly' | 'yearly'
  perks: string[];
};

export default function ManageSubscriptionClient({ plans, currentPlanId, hasActive }: { plans: Plan[]; currentPlanId: string | null; hasActive: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(currentPlanId);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function change() {
    if (!selected) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/subscription/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Napaka");
      setMsg(data?.message || "Spremenjeno");
      router.refresh();
    } catch (e: any) {
      setMsg(e.message || "Napaka");
    } finally {
      setLoading(false);
    }
  }

  async function cancelSub() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Napaka");
      setMsg(data?.message || "Preklicano");
      router.refresh();
    } catch (e: any) {
      setMsg(e.message || "Napaka");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const active = selected === p.id;
          const isCurrent = currentPlanId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={`text-left rounded-2xl border p-4 shadow-sm hover:border-gray-900 focus:outline-none ${active ? "border-gray-900" : "border-gray-200"}`}
              disabled={loading}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-700">{p.name}</div>
                {isCurrent && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">Trenutno</span>
                )}
              </div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-2xl font-extrabold">{p.price}</span>
                <span className="text-sm font-semibold">€</span>
                <span className="text-sm text-gray-500">/{p.period === 'monthly' ? 'mesec' : 'leto'}</span>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-gray-600">
                {p.perks.slice(0, 3).map((perk, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-600"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.01 7.01a1 1 0 01-1.42 0L3.296 8.742a1 1 0 011.414-1.414l3.152 3.151 6.303-6.302a1 1 0 011.539.113z" clipRule="evenodd"/></svg>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={change}
          disabled={loading || !selected}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {hasActive ? "Change Subscription" : "Activate Subscription"}
        </button>
        {hasActive && (
          <button
            onClick={cancelSub}
            disabled={loading}
            className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
          >
            Cancel Subscription
          </button>
        )}
        {msg && <span className="text-sm text-gray-700">{msg}</span>}
      </div>
    </div>
  );
}
