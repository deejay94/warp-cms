import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default platforms
  const platforms = ['LinkedIn', 'Threads', 'Instagram'];
  for (const platformName of platforms) {
    await prisma.platform.upsert({
      where: { name: platformName },
      update: {},
      create: { name: platformName },
    });
  }
  console.log('✓ Platforms created');

  // Create default categories
  const categories = ['Career Advice', 'Thought Leadership', 'Resources'];
  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
  }
  console.log('✓ Categories created');

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
