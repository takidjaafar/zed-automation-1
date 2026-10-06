import { getContext } from '@keystone-6/core/context'
import type { KeystoneContext } from '@keystone-6/core/types'
import config from './index'
import * as PrismaModule from "@prisma/client";

export type Context = KeystoneContext;

// Making sure multiple prisma clients are not created during hot reloading
export const keystoneContext: Context =
  (globalThis as any).keystoneContext ?? getContext(config, PrismaModule)

if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).keystoneContext = keystoneContext
}