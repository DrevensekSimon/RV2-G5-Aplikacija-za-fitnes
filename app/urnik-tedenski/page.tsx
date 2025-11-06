"use client";

import { useState, useEffect } from "react";
import { addDays, format, startOfDay, subDays } from "date-fns";
import { sl } from "date-fns/locale";

const times = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00"
];

// Example static sessions
const sampleSessions = [
  { time: "09:00", title: "HIIT", trainer: "Marko" },
  { time: "12:00", title: "Yoga", trainer: "Ana" },
  { time: "18:00", title: "Pilates", trainer: "Sara" }
];

export default function DailySchedule() {
  const [currentDay, setCurrentDay] = useState(startOfDay(new Date()));
  const [selectedSession, setSelectedSession] = useState<{ time: string; day: string; title?: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sessions, setSessions] = useState<{ time: string; title: string; trainer: string }[]>([]);

  // Add sample sessions
  const addSampleSessions = () => {
    setSessions(sampleSessions);
  };

  useEffect(() => {
    addSampleSessions();
  }, [currentDay]);

  const handleClick = (time: string) => {
    const session = sessions.find((s) => s.time === time);
    setSelectedSession({
      day: format(currentDay, "EEEE dd.MM.yyyy", { locale: sl }),
      time,
      title: session?.title
    });
    setShowModal(true);
  };

  const nextDay = () => setCurrentDay(addDays(currentDay, 1));
  const prevDay = () => setCurrentDay(subDays(currentDay, 1));

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      {/* Header with buttons */}
      <div className="flex justify-between w-full max-w-7xl mb-6">
        <h1 className="text-2xl font-bold">Dnevni urnik</h1>
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

      {/* Day Navigation */}
      <div className="flex items-center justify-center w-full max-w-7xl mb-4">
        <button onClick={prevDay} className="text-gray-500 text-lg px-4 hover:text-black">‹</button>
        <h2 className="text-lg font-semibold mx-4">
          {format(currentDay, "EEEE, dd MMMM yyyy", { locale: sl })}
        </h2>
        <button onClick={nextDay} className="text-gray-500 text-lg px-4 hover:text-black">›</button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-[80px_1fr] w-full max-w-7xl border border-gray-200">
        {/* Hour column */}
        <div className="flex flex-col">
          {times.map((t) => (
            <div
              key={t}
              className="h-16 flex items-center justify-center border-b border-gray-200 text-sm font-medium text-gray-600 bg-gray-50"
            >
              {t}
            </div>
          ))}
        </div>

        {/* Time slots column */}
        <div className="flex flex-col">
          {times.map((time, i) => {
            const session = sessions.find((s) => s.time === time);
            return (
              <div
                key={i}
                className={`h-16 border-b border-gray-200 flex items-center justify-center text-sm cursor-pointer transition
                  ${session ? "bg-yellow-100 text-gray-900 font-semibold" : "text-gray-400 hover:bg-gray-100"}`}
                onClick={() => handleClick(time)}
              >
                {session ? `${session.title} (${session.trainer})` : "No Session"}
              </div>
            );
          })}
        </div>
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
