"use client";

import BookTrainerClient from "./BookTrainerClient";

interface TrainerCardProps {
  trainerId: string | null;
  name: string;
  bio: string;
  slots: { iso: string; label: string }[];
}

export default function TrainerCard({ trainerId, name, bio, slots }: TrainerCardProps) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2a5 5 0 100 10 5 5 0 000-10zM2 22a10 10 0 1120 0H2z"/></svg>
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold">{name}</div>
          <p className="mt-2 text-sm text-gray-600">{bio}</p>
          <div className="mt-4">
            <div className="text-sm font-semibold">Proste ure</div>
            <BookTrainerClient 
              trainerId={trainerId}
              slots={slots}
              redirectUrl="/urnik-tedenski"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
