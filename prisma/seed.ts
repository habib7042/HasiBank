import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users if they don't exist
  const users = [
    { name: 'Shobuj' },
    { name: 'Shitu' }
  ]

  for (const userData of users) {
    const existingUser = await prisma.user.findFirst({
      where: { name: userData.name }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: userData
      })
      console.log(`✅ Created user: ${userData.name}`)
    } else {
      console.log(`ℹ️  User already exists: ${userData.name}`)
    }
  }

  // Create default PIN if it doesn't exist
  const existingSettings = await prisma.settings.findFirst()
  
  if (!existingSettings) {
    await prisma.settings.create({
      data: {
        pin: '1234' // Default PIN - users should change this
      }
    })
    console.log('✅ Created default PIN: 1234')
  } else {
    console.log('ℹ️  Settings already exist')
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })