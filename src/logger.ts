import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { Express } from "express";

export const initializeLogger = (app: Express) =>
  Sentry.init({
    dsn:
      "https://ab9f9f59edc24951859b126286fd5c2b@o1087718.ingest.sentry.io/6101339",
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({
        app
      })
    ],
    tracesSampleRate: 1.0
  });
