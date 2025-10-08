import fastify from "fastify";
import cors from '@fastify/cors'
import db from "./plugins/dbPlugin.ts";
import crudRoutes from "./routes/crudRoute.ts";
import auth from "./plugins/authPlugin.ts";
import maskFields from "./plugins/maskFieldsPlugin.ts";

export default async function createApp() {
  const app = fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true,
  })

  app.register(db);
  app.register(auth);
  app.register(crudRoutes, {prefix: "/rest/v1"});
  app.register(maskFields);


  // Error handling
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    reply.status(500).send({ error: "Internal Server Error" });
  });

  return app;
}