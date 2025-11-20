'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface GroupClass {
  id: string
  name: string
  trainer: string
  schedule: string
  status: string
  participants: number
}

export default function GroupClassesPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<GroupClass[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/admin/group-classes')
        if (res.ok) {
          const data = await res.json()
          setClasses(data)
        } else {
          console.error('Failed to fetch group classes:', res.status)
        }
      } catch (error) {
        console.error('Failed to fetch group classes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skupinske vadbe</h1>
          </div>
          <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black">
            + Dodaj vadbo
          </button>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Išči..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Nalagam...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Vadba</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Trener</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Termin</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((groupClass) => (
                    <tr key={groupClass.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{groupClass.name}</td>
                      <td className="px-4 py-3 text-gray-600">{groupClass.trainer}</td>
                      <td className="px-4 py-3 text-gray-600">{groupClass.schedule}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          groupClass.status === 'Prazno' ? 'bg-green-100 text-green-800' : 
                          groupClass.status === 'Polno' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {groupClass.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => router.push(`/nadzorna-plosca/skupinske-vadbe/${groupClass.id}`)} className="text-gray-900 hover:text-black text-sm font-medium">👥 Udeleženci</button>
                        <button className="text-gray-900 hover:text-black text-sm font-medium">✏️ Uredi</button>
                        <button className="text-gray-900 hover:text-black text-sm font-medium">🗑️ Izbriši</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
