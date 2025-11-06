"use client";

import { useState } from "react";

const days = ["Pon 20", "Tor 21", "Sre 22", "Čet 23", "Pet 24", "Sob 25", "Ned 26"];
const times = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00"
];

export default function WeeklySchedule() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleClick = (day, time) => {
    setSelectedSession({ day, time });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      {/* Header */}
      <div className="flex justify-between w-full max-w-6xl mb-6">
        <h1 className="text-2xl font-bold">Tedenski urnik</h1>
        <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
          Rezerviraj trenerja
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center w-full max-w-6xl mb-4">
        <button className="text-gray-500 text-lg px-4">‹</button>
        <h2 className="text-lg font-semibold">Oktober 2025</h2>
        <button className="text-gray-500 text-lg px-4">›</button>
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

        {/* Days columns */}
        {days.map((day) => (
          <div key={day} className="border-r border-gray-200">
            <div className="h-12 flex items-center justify-center font-semibold border-b border-gray-200 bg-gray-50">
              {day}
            </div>
            {times.map((time, i) => (
              <div
                key={i}
                className="h-16 flex items-center justify-center border-b border-gray-100 text-sm text-gray-400 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => handleClick(day, time)}
              >
                No Session
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-2">Potrditev</h3>
            <p className="text-sm text-gray-700 mb-6">
              Ali se želiš prijaviti na vadbo HIIT ({selectedSession.day}, {selectedSession.time})?
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
                  alert(`Prijavljen na HIIT ob ${selectedSession.time} (${selectedSession.day})`);
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
