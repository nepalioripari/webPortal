import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nepalioripari.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nepalioripari.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.email);

  // Create sample poll
  const poll = await prisma.poll.create({
    data: {
      question: "What type of news do you prefer?",
      options: {
        create: [
          { text: "Politics" },
          { text: "Sports" },
          { text: "Technology" },
          { text: "Entertainment" },
        ],
      },
    },
  });

  console.log("Sample poll created:", poll.question);

  // Create sample articles
  const articles = [
    {
      title: "Nepal Celebrates National Unity Day",
      content:
        "Nepal marks its National Unity Day with celebrations across the country. Citizens gather to honor the unity and diversity that makes Nepal unique.\n\nEvents were held in all major cities, with cultural programs showcasing the rich heritage of various ethnic groups.",
      category: "politics",
      published: true,
    },
    {
      title: "Nepal Cricket Team Qualifies for World Cup",
      content:
        "In a historic achievement, the Nepal cricket team has qualified for the upcoming World Cup. The team's journey has inspired millions across the nation.\n\nThe players showed exceptional skill and determination throughout the qualifying rounds.",
      category: "sports",
      published: true,
    },
    {
      title: "Tech Startups Thriving in Kathmandu Valley",
      content:
        "The tech ecosystem in Kathmandu Valley continues to grow, with new startups emerging in AI, fintech, and e-commerce sectors.\n\nInvestors are showing increased interest in Nepali tech companies, citing the young and talented workforce.",
      category: "technology",
      published: true,
    },
  ];

  for (const article of articles) {
    const slug =
      article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36);

    await prisma.article.create({
      data: {
        ...article,
        slug,
        excerpt: article.content.substring(0, 150),
        authorId: admin.id,
      },
    });
  }

  console.log("Sample articles created");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
