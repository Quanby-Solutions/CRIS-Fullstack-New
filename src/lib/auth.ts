import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import type { Adapter } from "@auth/core/adapters"

const adapter = PrismaAdapter(prisma) as unknown as Adapter

export const { auth, signIn, signOut, handlers: authHandler } = NextAuth({
    adapter: adapter,
    session: { strategy: 'jwt' },
    ...authConfig,
})