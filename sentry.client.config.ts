// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: process.env.NODE_ENV === "development",
  environment: process.env.NODE_ENV,

  // Adjust sampling rates in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1.0,

  // Enable performance monitoring
  enableTracing: true,

  integrations: [
    new Sentry.BrowserTracing({
      // Adjust sampling rate for browser performance monitoring
      tracePropagationTargets: ["localhost", "tonkura.blog"],
    }),
    new Sentry.Replay({
      // Additional Replay configuration
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
  ],

  // Additional production settings
  autoSessionTracking: true,
  sendDefaultPii: false,
});
