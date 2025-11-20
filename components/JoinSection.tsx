'use client'

import { useEffect, useState } from 'react'

export default function JoinSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('/api/me')
        setIsLoggedIn(res.ok)
      } catch {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }
    checkLogin()
  }, [])

  if (loading || isLoggedIn) {
    return null
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center">
        <h2 className="text-2xl font-extrabold">Pripravljen_a na svojo fitnes preobrazbo?</h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-600">Pridubi se naši skupnosti! Že danes se lahko začneš s svojimi fitnes cilji. Zaživaj novo tvojega uspešno!</p>
        <a href="/registracija" className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black">Pridubi se nam</a>
      </div>
    </section>
  )
}
