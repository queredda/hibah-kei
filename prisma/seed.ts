import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: "admin@example.com",
    },
  })

  if (!existingAdmin) {
    // Create admin user
    const hashedPassword = await hash("password123", 10)

    await prisma.user.create({
      data: {
        name: "Admin RT",
        email: "admin@example.com",
        password: hashedPassword,
        role: "RT",
      },
    })

    console.log("Admin user created successfully!")
  } else {
    console.log("Admin user already exists.")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
