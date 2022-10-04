import { createReactQueryHooks } from '@trpc/react';
import type { AppRouter } from 'backend/src';

export const trpc = createReactQueryHooks<AppRouter>();
