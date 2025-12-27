import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Same config for both Node.js and Edge runtimes
  if (
    process.env.NEXT_RUNTIME === 'nodejs' ||
    process.env.NEXT_RUNTIME === 'edge'
  ) {
    await import('./sentry.server.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
