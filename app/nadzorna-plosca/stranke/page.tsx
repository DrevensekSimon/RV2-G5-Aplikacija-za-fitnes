'use client'

import { useEffect, useState } from 'react'

interface Member {
  id: string
  first_name: string
  last_name: string
  email: string
  status: string
  joined_date: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/admin/members')
        if (res.ok) {
          const data = await res.json()
          setMembers(data)
        } else {
          console.error('Failed to fetch members:', res.status)
        }
      } catch (error) {
        console.error('Failed to fetch members:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const filteredMembers = members.filter(m =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pregled nad strankami</h1>
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
                    <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Ime Priimek</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Datum vpisa</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Akcija</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{member.id.slice(0, 4)}</td>
                      <td className="px-4 py-3 font-medium">{member.first_name} {member.last_name}</td>
                      <td className="px-4 py-3 text-gray-600">{member.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          member.status === 'Aktiven' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{member.joined_date}</td>
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
