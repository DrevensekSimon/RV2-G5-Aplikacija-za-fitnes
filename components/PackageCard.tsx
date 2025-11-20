'use client'

import { useEffect, useState } from 'react'

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-600">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.01 7.01a1 1 0 01-1.42 0L3.296 8.742a1 1 0 011.414-1.414l3.152 3.151 6.303-6.302a1 1 0 011.539.113z" clipRule="evenodd" />
    </svg>
  )
}

export default function PackageCard({ pkg }: { pkg: { id: bigint; name: string; price: string; period: string; features: string[] } }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in by trying to fetch /api/me
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/me')
        setIsLoggedIn(res.ok)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkLogin()
  }, [])

  const handleClick = () => {
    if (isLoggedIn) {
      window.location.href = '/moj-profil/narocnina'
    } else {
      window.location.href = '/registracija'
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-gray-700">{pkg.name}</h3>
        <div className="mt-2 flex items-end justify-center gap-1">
          <span className="text-4xl font-extrabold tracking-tight">{pkg.price}</span>
          <span className="text-2xl font-bold">€</span>
          <span className="text-gray-500">/{pkg.period}</span>
        </div>
      </div>
      <ul className="mt-6 grow space-y-2 text-sm text-gray-700">
        {pkg.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2"><CheckIcon /><span>{f}</span></li>
        ))}
      </ul>
      <button onClick={handleClick} className="mt-6 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 text-center block">Izberi paket</button>
    </div>
  )
}
