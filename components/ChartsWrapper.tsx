'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartsWrapperProps {
  membersByClass?: Array<{ session_id: string; _count: { session_id: number } }>
}

export default function ChartsWrapper({ membersByClass }: ChartsWrapperProps) {
  return (
    <>
      {/* Line Chart - Members */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="font-semibold text-gray-900 mb-2">Člani</h3>
        <p className="text-sm text-gray-600 mb-4">Novi člani in člani, ki so odpovedali</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={[
            { month: 'Jan', newMembers: 120, churnedMembers: 10 },
            { month: 'Feb', newMembers: 140, churnedMembers: 12 },
            { month: 'Mar', newMembers: 160, churnedMembers: 8 },
            { month: 'Apr', newMembers: 170, churnedMembers: 15 },
            { month: 'May', newMembers: 180, churnedMembers: 11 },
            { month: 'Jun', newMembers: 190, churnedMembers: 9 },
            { month: 'Jul', newMembers: 180, churnedMembers: 13 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="newMembers" stroke="#1f2937" strokeWidth={2} name="New Members" />
            <Line type="monotone" dataKey="churnedMembers" stroke="#9ca3af" strokeWidth={2} name="Churned Members" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Donut Chart - Members by Class */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="font-semibold text-gray-900 mb-2">Porazdelitev udeležencev po vadbi</h3>
        <p className="text-sm text-gray-600 mb-4">Po tipih vadb</p>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={membersByClass && membersByClass.length > 0 ? 
                membersByClass.map((item: any, idx: number) => ({
                  name: `Vadba ${idx + 1}`,
                  value: item._count.session_id
                })) :
                [{ name: 'Ni podatkov', value: 1 }]
              }
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {membersByClass && membersByClass.length > 0 ? 
                membersByClass.map((item: any, idx: number) => (
                  <Cell key={`cell-${idx}`} fill={['#1f2937', '#3b82f6', '#b8860b', '#8b1538', '#6b7280'][idx % 5]} />
                )) :
                <Cell fill="#d1d5db" />
              }
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Revenue by Type */}
      <div className="rounded-lg bg-white p-6 shadow md:col-span-2">
        <h3 className="font-semibold text-gray-900 mb-2">Prihodi po tipih</h3>
        <p className="text-sm text-gray-600 mb-4">Porazdelitev po vrsti storitve</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[
            { type: 'Osebni treningi', revenue: 98000 },
            { type: 'Skupinske vadbe', revenue: 65000 },
            { type: 'Fitnes članarine', revenue: 52000 },
            { type: 'Suplementi', revenue: 18000 },
            { type: 'Merch', revenue: 8000 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="type" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#1f2937" name="Prihodek" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
