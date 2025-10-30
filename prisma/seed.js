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

async function main() {
  await ensureRoles()
  await seedPlans()
  await seedClassTypes()
  await seedLocations()
  const trainerUser = await ensureTrainer()
  await seedSessions(trainerUser.id)
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
