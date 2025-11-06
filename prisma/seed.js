const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function ensureRoles() {
  const count = await prisma.role.count()
  if (count === 0) {
    await prisma.role.createMany({ data: [
      { name: 'member' },
      { name: 'trainer' },
      { name: 'admin' }
    ] })
  }
}

async function seedSessionsForTrainers(trainerIds) {
  const types = await prisma.classType.findMany({ orderBy: { id: 'asc' } })
  const locations = await prisma.location.findMany({ orderBy: { id: 'asc' }, take: 1 })
  if (types.length === 0 || locations.length === 0) return
  const locationId = locations[0].id
  const now = new Date()
  for (const tid of trainerIds) {
    const existing = await prisma.classSession.count({ where: { coach_id: tid } })
    if (existing > 0) continue
    const data = []
    for (const [i, ct] of types.entries()) {
      const d1 = addDays(now, 2 + i)
      d1.setHours(9 + (i % 3) * 2, 0, 0, 0)
      const d2 = addDays(now, 5 + i)
      d2.setHours(14 + (i % 3), 0, 0, 0)
      data.push(
        { class_type_id: ct.id, coach_id: tid, location_id: locationId, start_at: d1, duration_min: ct.default_duration_min, capacity_override: null, status: 'scheduled' },
        { class_type_id: ct.id, coach_id: tid, location_id: locationId, start_at: d2, duration_min: ct.default_duration_min, capacity_override: null, status: 'scheduled' },
      )
    }
    for (const s of data) {
      await prisma.classSession.create({ data: s })
    }
  }
}

async function seedPlans() {
  const count = await prisma.membershipPlan.count()
  if (count === 0) {
    await prisma.membershipPlan.createMany({ data: [
      { name: 'Basic', price_eur: '29.00', billing_period: 'monthly', perks_json: ['Dostop do fitnesa', '1x mesečno skupinska vadba'], is_active: true },
      { name: 'Standard', price_eur: '49.00', billing_period: 'monthly', perks_json: ['Dostop do fitnesa', 'Neomejene skupinske vadbe', 'Osnovni plan'], is_active: true },
      { name: 'Premium', price_eur: '55.00', billing_period: 'monthly', perks_json: ['Dostop 24/7', 'Neomejene skupinske vadbe', 'Vključeno svetovanje'], is_active: true }
    ] })
  }
}

async function seedClassTypes() {
  const count = await prisma.classType.count()
  if (count === 0) {
    await prisma.classType.createMany({ data: [
      { name: 'HIIT Blast', description: 'Visoko intenzivni intervalni trening.', default_duration_min: 45 },
      { name: 'Yoga Flow', description: 'Sproščena vadba za gibljivost in ravnovesje.', default_duration_min: 60 }
    ] })
  }
}

async function seedLocations() {
  const count = await prisma.location.count()
  if (count === 0) {
    await prisma.location.createMany({ data: [
      { name: 'Glavna dvorana', capacity: 20 },
      { name: 'Studio 2', capacity: 12 }
    ] })
  }
}

async function ensureTrainer() {
  const email = 'trener@example.com'
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const trainerRole = await prisma.role.findFirst({ where: { name: 'trainer' } })
    user = await prisma.user.create({
      data: {
        email,
        username: 'trener',
        first_name: 'Janez',
        last_name: 'Trener',
        phone: '000-000-000',
        role_id: trainerRole ? trainerRole.id : 1,
        is_active: true,
      }
    })
    await prisma.trainer.create({ data: { user_id: user.id, bio: 'Licenciran osebni trener.' } })
  }
  return user
}

// Ensure at least 3 trainers exist, returns array of trainer users
async function ensureThreeTrainers() {
  const desired = [
    { email: 'trener1@example.com', username: 'trener1', first_name: 'Maja', last_name: 'Novak' },
    { email: 'trener2@example.com', username: 'trener2', first_name: 'Luka', last_name: 'Kovač' },
    { email: 'trener3@example.com', username: 'trener3', first_name: 'Eva',  last_name: 'Horvat' },
  ]
  const trainerRole = await prisma.role.findFirst({ where: { name: 'trainer' } })
  const created = []
  for (const t of desired) {
    let user = await prisma.user.findUnique({ where: { email: t.email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: t.email,
          username: t.username,
          first_name: t.first_name,
          last_name: t.last_name,
          phone: '000-000-000',
          role_id: trainerRole ? trainerRole.id : 1,
          is_active: true,
        }
      })
    }
    const tr = await prisma.trainer.findUnique({ where: { user_id: user.id } })
    if (!tr) {
      await prisma.trainer.create({ data: { user_id: user.id, bio: 'Osebni trener z izkušnjami.' } })
    }
    created.push(user)
  }
  return created
}

function addDays(d, days) {
  const nd = new Date(d.getTime())
  nd.setDate(nd.getDate() + days)
  return nd
}

async function seedSessions(trainerId) {
  const anySession = await prisma.classSession.findFirst()
  if (anySession) return

  const types = await prisma.classType.findMany({ orderBy: { id: 'asc' } })
  const locations = await prisma.location.findMany({ orderBy: { id: 'asc' }, take: 1 })
  if (types.length === 0 || locations.length === 0) return
  const locationId = locations[0].id
  const now = new Date()

  const data = []
  for (const [i, ct] of types.entries()) {
    const d1 = addDays(now, 2 + i)
    d1.setHours(18, 0, 0, 0)
    const d2 = addDays(now, 5 + i)
    d2.setHours(19, 0, 0, 0)
    data.push(
      { class_type_id: ct.id, coach_id: trainerId, location_id: locationId, start_at: d1, duration_min: ct.default_duration_min, capacity_override: null, status: 'scheduled' },
      { class_type_id: ct.id, coach_id: trainerId, location_id: locationId, start_at: d2, duration_min: ct.default_duration_min, capacity_override: null, status: 'scheduled' },
    )
  }
  // create sequentially to avoid BigInt issues in some drivers
  for (const s of data) {
    await prisma.classSession.create({ data: s })
  }
}

// Demo member user, active subscription and a couple of registrations
async function ensureMemberUser() {
  const email = 'clan@example.com'
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const memberRole = await prisma.role.findFirst({ where: { name: 'member' } })
    user = await prisma.user.create({
      data: {
        email,
        username: 'demo',
        first_name: 'Ana',
        last_name: 'Uporabnik',
        phone: '031 456 789',
        role_id: memberRole ? memberRole.id : 1,
        is_active: true,
      }
    })
  }
  return user
}

async function ensureActiveSubscription(userId) {
  const existing = await prisma.subscription.findFirst({ where: { user_id: userId, status: 'active' } })
  if (existing) return existing
  const plan = await prisma.membershipPlan.findFirst({ orderBy: { price_eur: 'asc' } })
  const now = new Date()
  const start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
  const end = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)
  return prisma.subscription.create({
    data: {
      user_id: userId,
      plan_id: plan.id,
      status: 'active',
      current_period_start: start,
      current_period_end: end,
      auto_renew: true,
    }
  })
}

async function seedMemberRegistrations(userId) {
  const upcoming = await prisma.classSession.findMany({
    where: { start_at: { gte: new Date() } },
    orderBy: { start_at: 'asc' },
    take: 2,
  })
  for (const s of upcoming) {
    const exists = await prisma.classRegistration.findUnique({ where: { session_id_user_id: { session_id: s.id, user_id: userId } } })
    if (!exists) {
      await prisma.classRegistration.create({ data: { session_id: s.id, user_id: userId, registered_at: new Date(), status: 'registered' } })
    }
  }
}

async function main() {
  await ensureRoles()
  await seedPlans()
  await seedClassTypes()
  await seedLocations()
  // ensure at least 3 trainers
  const trainerUsers = await ensureThreeTrainers()
  await seedSessionsForTrainers(trainerUsers.map(u => u.id))
  const memberUser = await ensureMemberUser()
  const sub = await ensureActiveSubscription(memberUser.id)
  // seed payments if none
  const countPayments = await prisma.payment.count({ where: { subscription_id: sub.id } })
  if (countPayments === 0) {
    const now = new Date()
    const months = [1, 2, 3, 4]
    for (const m of months) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
      await prisma.payment.create({
        data: {
          subscription_id: sub.id,
          amount_eur: (await prisma.membershipPlan.findUnique({ where: { id: sub.plan_id } })).price_eur,
          paid_at: d,
          method: 'card',
          status: m === 2 ? 'failed' : 'succeeded'
        }
      })
    }
  }
  await seedMemberRegistrations(memberUser.id)
}

main()
  .then(async () => {
    console.log('Seed completed')
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
