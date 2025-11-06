"use client";

import { useState, useEffect } from "react";
import { addWeeks, subWeeks, startOfWeek, format, addDays } from "date-fns";
import { sl } from "date-fns/locale";

const times = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00"
];

// Static sample sessions for the week
const sampleSessions = [
  { dayOffset: 0, time: "09:00", title: "HIIT", trainer: "Marko" },
  { dayOffset: 0, time: "18:00", title: "Pilates", trainer: "Sara" },
  { dayOffset: 2, time: "12:00", title: "Yoga", trainer: "Ana" },
  { dayOffset: 4, time: "16:00", title: "CrossFit", trainer: "Peter" }
];

export default function WeeklySchedule() {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSession, setSelectedSession] = useState<{ day: string; time: string; title?: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sessions, setSessions] = useState<typeof sampleSessions>([]);

  // Load sample sessions
  const addSampleSessions = () => {
    setSessions(sampleSessions);
  };

  useEffect(() => {
    addSampleSessions();
  }, [currentWeek]);

  const handleClick = (day: string, time: string) => {
    const dayIndex = days.findIndex(d => format(d, "EEEE dd.MM", { locale: sl }) === day);
    const session = sessions.find(s => s.dayOffset === dayIndex && s.time === time);
    setSelectedSession({ day, time, title: session?.title });
    setShowModal(true);
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
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Dodaj skupinsko vadbo
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-green-700">
            Dodaj termin
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
            Rezerviraj trenerja
          </button>
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
        {days.map((day, dayIndex) => (
          <div key={day.toISOString()} className="border-r border-gray-200">
            <div className="h-12 flex items-center justify-center font-semibold border-b border-gray-200 bg-gray-50">
              {format(day, "EEE dd", { locale: sl })}
            </div>
            {times.map((time, i) => {
              const session = sessions.find(s => s.dayOffset === dayIndex && s.time === time);
              return (
                <div
                  key={i}
                  className={`h-16 flex items-center justify-center border-b border-gray-100 text-sm cursor-pointer transition
                    ${session ? "bg-yellow-100 text-gray-900 font-semibold" : "text-gray-400 hover:bg-gray-100"}`}
                  onClick={() => handleClick(format(day, "EEEE dd.MM", { locale: sl }), time)}
                >
                  {session ? `${session.title} (${session.trainer})` : "No Session"}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Booking Confirmation Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-2">Potrditev</h3>
            <p className="text-sm text-gray-700 mb-6">
              {selectedSession.title
                ? `Ali se želiš prijaviti na ${selectedSession.title} (${selectedSession.day} ob ${selectedSession.time})?`
                : `Ali se želiš prijaviti na vadbo HIIT (${selectedSession.day} ob ${selectedSession.time})?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setShowModal(false)}
              >
                Ne
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                onClick={() => {
                  alert(`Prijavljen na ${selectedSession.title || "HIIT"} ob ${selectedSession.time} (${selectedSession.day})`);
                  setShowModal(false);
                }}
              >
                Da
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
