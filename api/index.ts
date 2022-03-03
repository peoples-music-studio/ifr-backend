import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import { initializeLogger } from "../src/logger";
import { resolvers } from "../src/resolvers";
import { typeDefs } from "../src/type-definitions";
import * as Sentry from "@sentry/node";
import express from "express";
import faunadb from "faunadb";
import http from "http";

async function startApolloServer({ typeDefs, resolvers, dataSources }) {
  const app = express();
  initializeLogger(app);
  app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
  app.use(Sentry.Handlers.tracingHandler() as express.RequestHandler);

  const httpServer = http.createServer(app);

  const logger = {
    log: (m) => {
      console.log(m);
      Sentry.captureMessage(m);
    },
    info: (m) => {
      console.info(m);
      Sentry.captureMessage(m);
    },
    debug: (m) => {
      console.debug(m);
      Sentry.captureMessage(m);
    },
    error: (e) => {
      console.error(e);
      Sentry.captureException(e);
    },
    warn: (e) => {
      console.warn(e);
      Sentry.captureException(e);
    }
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    context: {
      logger
    },
    introspection: true,
    logger,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageGraphQLPlayground({
        endpoint: "https://csb-cfref-green.vercel.app/api/"
      })
    ]
  });

  await server.start();
  server.applyMiddleware({
    app,
    path: "/"
  });
  app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);

  return app;
}

export default startApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    db: new faunadb.Client({
      secret: "fnAEaCoH5hAASM7uAvNnfiZfUnX0Il74pUDSp0-p",
      domain: "db.us.fauna.com",
      scheme: "https"
    })
  })
});
