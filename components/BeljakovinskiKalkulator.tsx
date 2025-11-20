'use client'

import { useState } from "react"

export default function BeljakovinskiKalkulator() {
  const [teza, setTeza] = useState("")
  const [starost, setStarost] = useState("")
  const [spol, setSpol] = useState("")
  const [aktivnost, setAktivnost] = useState("")
  const [cilj, setCilj] = useState("")
  const [rezultat, setRezultat] = useState<string | null>(null)

  const izracunaj = () => {
    if (!teza || !starost || !spol || !aktivnost || !cilj) {
      setRezultat("Prosimo izpolni vsa polja.")
      return
    }

    const kg = Number(teza)
    const age = Number(starost)

    // 1) Faktor glede na cilj (zahteva naloge)
    let factorGoal = 1.4 // default za vzdrževanje

    switch (cilj) {
      case "hujšanje":
        factorGoal = 1.6
        break
      case "vzdrzevanje":
        factorGoal = 1.4
        break
      case "masa":
        factorGoal = 2.0
        break
    }

    // 2) Aktivnost
    let factorActivity = 0
    if (aktivnost === "zmerno") factorActivity = 0.2
    if (aktivnost === "visoko") factorActivity = 0.4
    if (aktivnost === "atlet") factorActivity = 0.6

    // 3) Spol
    let factorGender = spol === "moski" ? 0.1 : 0

    // 4) Starost
    let factorAge = 0
    if (age >= 30 && age <= 50) factorAge = 0.1
    if (age > 50) factorAge = 0.2

    const koncniFaktor =
      factorGoal + factorActivity + factorGender + factorAge

    const protein = kg * koncniFaktor

    setRezultat(`Priporočen dnevni vnos: ${protein.toFixed(0)} g beljakovin.`)
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">

        <h1 className="text-2xl font-bold text-center mb-6">
          Beljakovinski kalkulator
        </h1>

        {/* Teža */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Teža (kg)</label>
          <input
            type="number"
            value={teza}
            onChange={(e) => setTeza(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Vpiši telesno maso"
          />
        </div>

        {/* Starost */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Starost</label>
          <input
            type="number"
            value={starost}
            onChange={(e) => setStarost(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Vpiši starost"
          />
        </div>

        {/* Spol */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Spol</label>
          <select
            value={spol}
            onChange={(e) => setSpol(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Izberi spol</option>
            <option value="moski">Moški</option>
            <option value="zenska">Ženska</option>
          </select>
        </div>

        {/* Aktivnost */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Koliko si aktiven?</label>
          <select
            value={aktivnost}
            onChange={(e) => setAktivnost(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Izberi stopnjo aktivnosti</option>
            <option value="nizko">Malo / nič treninga</option>
            <option value="zmerno">2–3x tedensko</option>
            <option value="visoko">4–5x tedensko</option>
            <option value="atlet">Vsak dan / športnik</option>
          </select>
        </div>

        {/* Cilj — popravljeno točno po navodilih */}
        <div className="mb-6">
          <label className="block font-medium mb-1">Cilj</label>
          <select
            value={cilj}
            onChange={(e) => setCilj(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Izberi svoj cilj</option>
            <option value="hujšanje">Hujšanje</option>
            <option value="vzdrzevanje">Vzdrževanje teže</option>
            <option value="masa">Povečanje mišične mase</option>
          </select>
        </div>

        <button
          onClick={izracunaj}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Izračunaj
        </button>

        {rezultat && (
          <div className="mt-6 text-center font-semibold text-lg">
            {rezultat}
          </div>
        )}
      </div>
    </div>
  )
}
