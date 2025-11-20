'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Participant {
  id: string
  first_name: string
  last_name: string
  email: string
  status: string
  joined_date: string
}

export default function ClassParticipantsPage() {
  const params = useParams()
  const classId = params.id as string
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [className, setClassName] = useState('')

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await fetch(`/api/admin/group-classes/${classId}/participants`)
        if (res.ok) {
          const data = await res.json()
          setParticipants(data.participants || [])
          setClassName(data.className || 'Skupinska vadba')
        } else {
          console.error('Failed to fetch participants:', res.status)
        }
      } catch (error) {
        console.error('Failed to fetch participants:', error)
      } finally {
        setLoading(false)
      }
    }

    if (classId) fetchParticipants()
  }, [classId])

  const filteredParticipants = participants.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/nadzorna-plosca/skupinske-vadbe" className="hover:text-gray-900">Skupinske vadbe</Link>
            <span>›</span>
            <span>Pregled nad udeleženci</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Pregled nad udeleženci</h1>
          <p className="mt-2 text-gray-600">{className}</p>
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
          ) : filteredParticipants.length === 0 ? (
            <div className="text-center py-8 text-gray-600">Ni udeležencev</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Ime Priimek</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Datum vpisa</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Akcija</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{participant.id.slice(0, 4)}</td>
                      <td className="px-4 py-3 font-medium">{participant.first_name} {participant.last_name}</td>
                      <td className="px-4 py-3 text-gray-600">{participant.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          participant.status === 'Aktiven' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {participant.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{participant.joined_date}</td>
                      <td className="px-4 py-3">
                        <button className="text-gray-900 hover:text-black text-sm font-medium">Pogled</button>
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
