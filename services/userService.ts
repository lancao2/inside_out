import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class UserService {
  static async createUser(data: {
    email: string
    username: string
    name: string
    password: string
    bio?: string
    avatarUrl?: string
    location?: string
    website?: string
  }) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingEmail) throw new Error('Email already exists')

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } })
    if (existingUsername) throw new Error('Username already exists')

    const user = await prisma.user.create({ data })
    return user
  }
}
