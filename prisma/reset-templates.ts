import { prisma } from '@/lib/prisma'

async function main() {
  console.log('Deleting all existing templates...')
  
  await prisma.resumeTemplate.deleteMany({})
  await prisma.portfolioTemplate.deleteMany({})
  await prisma.coverLetterTemplate.deleteMany({})
  
  console.log('All templates deleted successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
