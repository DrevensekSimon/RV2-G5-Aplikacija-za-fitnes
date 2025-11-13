"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addWeeks, subWeeks, startOfWeek, format, addDays } from "date-fns";
import { sl } from "date-fns/locale";

const times = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00"
];

type FetchedSession = {
  id: string;
  start_at: string; // ISO
  title: string;
  trainer: string;
  location: string;
};

export default function WeeklySchedule() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [sessions, setSessions] = useState<FetchedSession[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isTrainer, setIsTrainer] = useState(false);

  useEffect(() => {
    const fetchWeek = async () => {
      setLoading(true);
      try {
        const from = new Date(currentWeek);
        const to = new Date(addDays(currentWeek, 7));
        const res = await fetch(`/api/sessions?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`);
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        setSessions(json.sessions || []);
      } catch (e) {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWeek();
  }, [currentWeek]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/me');
        const json = await res.json();
        setIsTrainer((json?.user?.role || '').toLowerCase() === 'trainer' || (json?.user?.role || '').toLowerCase() === 'trener');
      } catch {}
    };
    fetchMe();
  }, []);

  const sessionsByDayTime = useMemo(() => {
    const map = new Map<string, Map<string, FetchedSession>>(); // date -> time -> session
    for (const s of sessions) {
      const dt = new Date(s.start_at);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const hh = String(dt.getHours()).padStart(2, '0');
      const mi = String(dt.getMinutes()).padStart(2, '0');
      const time = `${hh}:${mi}`;
      const inner = map.get(key) || new Map<string, FetchedSession>();
      inner.set(time, s);
      map.set(key, inner);
    }
    return map;
  }, [sessions]);

  const gotoDaily = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    router.push(`/urnik-dnevni/${yyyy}-${mm}-${dd}`);
  };

  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const prevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      {/* Header */}
      <div className="flex justify-between w-full max-w-6xl mb-6">
        <h1 className="text-2xl font-bold">Tedenski urnik</h1>
        <div className="flex gap-3">
          {isTrainer ? (
            <>
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-blue-700">Dodaj skupinsko vadbo</button>
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-green-700">Dodaj termin</button>
            </>
          ) : (
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">Rezerviraj trenerja</button>
          )}
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-center w-full max-w-6xl mb-4">
        <button onClick={prevWeek} className="text-gray-500 text-lg px-4 hover:text-black">‹</button>
        <h2 className="text-lg font-semibold">
          {format(currentWeek, "MMMM yyyy", { locale: sl })}
        </h2>
        <button onClick={nextWeek} className="text-gray-500 text-lg px-4 hover:text-black">›</button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-8 w-full max-w-6xl border border-gray-200">
        {/* Time column */}
        <div className="border-r border-gray-200 bg-gray-50 text-sm font-medium text-gray-600">
          {times.map((t) => (
            <div key={t} className="h-16 flex items-center justify-center border-b border-gray-200">
              {t}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const yyyy = day.getFullYear();
          const mm = String(day.getMonth() + 1).padStart(2, '0');
          const dd = String(day.getDate()).padStart(2, '0');
          const dkey = `${yyyy}-${mm}-${dd}`;
          return (
            <div key={day.toISOString()} className="border-r border-gray-200">
              <div
                className="h-12 flex items-center justify-center font-semibold border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => gotoDaily(day)}
              >
                {format(day, "EEE dd", { locale: sl })}
              </div>
              {times.map((time, i) => {
                const session = sessionsByDayTime.get(dkey)?.get(time);
                return (
                  <div
                    key={i}
                    className={`h-16 flex items-center justify-center border-b border-gray-100 text-sm cursor-pointer transition ${session ? "bg-yellow-100 text-gray-900 font-semibold" : "text-gray-400 hover:bg-gray-100"}`}
                    onClick={() => gotoDaily(day)}
                  >
                    {session ? `${session.title}${session.trainer ? ` (${session.trainer})` : ''}` : "No Session"}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {loading ? <div className="mt-4 text-sm text-gray-600">Nalaganje ...</div> : null}
    </div>
  );
}