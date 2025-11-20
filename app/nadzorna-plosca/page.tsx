'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'

const ChartsWrapper = dynamic(() => import('@/components/ChartsWrapper'), { ssr: false, loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse"></div> })

interface DashboardStats {
  totalUsers: number
  newMembers: number
  totalRevenue: string
  totalClasses: number
  membersByClass: Array<{ session_id: string; _count: { session_id: number } }>
  recentActivity: Array<{ time: string; action: string }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard-stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        } else {
          console.error('Failed to fetch stats:', res.status, res.statusText)
          const error = await res.json().catch(() => ({}))
          console.error('Error details:', error)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="p-8">Nalagam...</div>
  }

  if (!stats) {
    return <div className="p-8">Napaka pri nalaganju podatkov</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin nadzorna plošča</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="rounded-lg bg-white p-6 shadow cursor-pointer hover:shadow-lg transition" onClick={() => window.location.href = '/nadzorna-plosca/stranke'}>
            <div className="text-sm font-medium text-gray-600">Vsi člani</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            <button className="mt-4 text-sm text-gray-900 hover:text-black font-medium">Pregled nad strankami</button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-600">Vsi naročniki</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.newMembers}</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-600">Skupni prihodek</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalRevenue}€</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-600">Vsa vadba</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalClasses}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse"></div>}>
            <ChartsWrapper membersByClass={(stats as any).membersByClass} />
          </Suspense>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="font-semibold text-gray-900 mb-4">Zadnje aktivnosti</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-600">
                <span>{activity.action}</span>
                <span>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
