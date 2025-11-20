"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addDays, format, isValid, parseISO, startOfDay } from "date-fns";
import { sl } from "date-fns/locale";
import BookTrainerClient from "@/components/BookTrainerClient";

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

export default function DailyScheduleByDate() {
  const params = useParams<{ date: string }>();
  const router = useRouter();
  const dateParam = Array.isArray(params?.date) ? params.date[0] : params?.date;

  const initialDay = useMemo(() => {
    if (!dateParam) return startOfDay(new Date());
    const d = parseISO(dateParam);
    return isValid(d) ? startOfDay(d) : startOfDay(new Date());
  }, [dateParam]);

  const [currentDay, setCurrentDay] = useState<Date>(initialDay);
  const [sessions, setSessions] = useState<FetchedSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTrainer, setIsTrainer] = useState(false);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<FetchedSession | null>(null);
  const [trainers, setTrainers] = useState<Array<{ user_id: string; user: { first_name: string; last_name: string } }>>([]);

  useEffect(() => {
    // Sync state when URL param changes
    setCurrentDay(initialDay);
  }, [initialDay]);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const from = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
        const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
        const fromISO = from.toISOString();
        const toISO = to.toISOString();
        const res = await fetch(`/api/sessions?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`);
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        setSessions(json.sessions || []);
      } catch (e) {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [currentDay]);

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

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const res = await fetch('/api/trainers');
        if (res.ok) {
          const json = await res.json();
          setTrainers(json.trainers || []);
        }
      } catch {}
    };
    fetchTrainers();
  }, []);

  const goto = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    router.push(`/urnik-dnevni/${yyyy}-${mm}-${dd}`);
  };

  const nextDay = () => goto(addDays(currentDay, 1));
  const prevDay = () => goto(addDays(currentDay, -1));

  const sessionByTime = useMemo(() => {
    const map = new Map<string, FetchedSession>();
    for (const s of sessions) {
      const dt = new Date(s.start_at);
      const hh = String(dt.getHours()).padStart(2, '0');
      const mi = String(dt.getMinutes()).padStart(2, '0');
      map.set(`${hh}:${mi}`, s);
    }
    return map;
  }, [sessions]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <div className="flex justify-between w-full max-w-7xl mb-6">
        <h1 className="text-2xl font-bold">Dnevni urnik</h1>
        <div className="flex gap-3">
          {isTrainer ? (
            <>
              <button className="bg-black text-white px-4 py-2 rounded-md">Dodaj skupinsko vadbo</button>
              <button className="bg-black text-white px-4 py-2 rounded-md">Dodaj termin</button>
            </>
         ) : (
            <button onClick={() => router.push('/rezervacija-trenerja')} className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">Rezerviraj trenerja</button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center w-full max-w-7xl mb-4">
        <button onClick={prevDay} className="text-gray-500 text-lg px-4 hover:text-black">‹</button>
        <h2 className="text-lg font-semibold mx-4">
          {format(currentDay, "EEEE, dd MMMM yyyy", { locale: sl })}
        </h2>
        <button onClick={nextDay} className="text-gray-500 text-lg px-4 hover:text-black">›</button>
      </div>

      <div className="grid grid-cols-[80px_1fr] w-full max-w-7xl border border-gray-200">
        <div className="flex flex-col">
          {times.map((t) => (
            <div key={t} className="h-16 flex items-center justify-center border-b border-gray-200 text-sm font-medium text-gray-600 bg-gray-50">
              {t}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {loading ? (
            <div className="p-4 text-sm text-gray-600">Nalaganje ...</div>
          ) : (
            times.map((time) => {
              const s = sessionByTime.get(time);
              return (
                <div 
                  key={time} 
                  onClick={() => {
                    if (!isTrainer) {
                      if (s) {
                        setSelectedSession(s);
                      } else {
                        setBookingTime(time);
                      }
                    }
                  }}
                  className={`h-16 border-b border-gray-200 flex items-center justify-center text-sm cursor-pointer hover:bg-gray-50 ${s ? "bg-yellow-100 text-gray-900 font-semibold" : "text-gray-400"}`}>
                  {s ? `${s.title}${s.trainer ? ` (${s.trainer})` : ''}` : "No Session"}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingTime && !isTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Rezerviraj trenerja za {bookingTime}</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {trainers.map((trainer) => (
                <div key={trainer.user_id} className="border rounded-lg p-4">
                  <div className="font-medium mb-3">{trainer.user.first_name} {trainer.user.last_name}</div>
                  <BookTrainerClient 
                    trainerId={trainer.user_id}
                    slots={[{ iso: '', label: bookingTime }]}
                    bookDate={currentDay}
                    onSuccess={() => {
                      setBookingTime(null);
                      // Refresh sessions
                      const fetchSessions = async () => {
                        try {
                          const from = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
                          const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
                          const res = await fetch(`/api/sessions?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`);
                          if (res.ok) {
                            const json = await res.json();
                            setSessions(json.sessions || []);
                          }
                        } catch {}
                      };
                      fetchSessions();
                    }}
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={() => setBookingTime(null)}
              className="mt-4 w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Zapri
            </button>
          </div>
        </div>
      )}

      {/* Delete Session Modal */}
      {selectedSession && !isTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Odpravi rezervacijo?</h2>
            <p className="text-sm text-gray-600 mb-4">
              {selectedSession.title}{selectedSession.trainer ? ` z ${selectedSession.trainer}` : ''}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/pt/session/${selectedSession.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      setSelectedSession(null);
                      // Refresh sessions
                      const from = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
                      const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
                      const sessRes = await fetch(`/api/sessions?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`);
                      if (sessRes.ok) {
                        const json = await sessRes.json();
                        setSessions(json.sessions || []);
                      }
                    }
                  } catch {}
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Izbriši
              </button>
              <button 
                onClick={() => setSelectedSession(null)}
                className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Prekliči
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
