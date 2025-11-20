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
                      <td className="px-4 py-3 text-right flex gap-2 justify-end">
                        <button onClick={() => router.push(`/nadzorna-plosca/skupinske-vadbe/${groupClass.id}`)} className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
                          Udeleženci
                        </button>
                        <button className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
                          Uredi
                        </button>
                        <button className="rounded border border-red-600 bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                          Izbriši
                        </button>
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
