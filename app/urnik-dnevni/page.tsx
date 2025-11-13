import { redirect } from 'next/navigation'
import { startOfDay } from 'date-fns'

export default function DailyRedirect() {
  const now = startOfDay(new Date())
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  redirect(`/urnik-dnevni/${yyyy}-${mm}-${dd}`)
}
