import fp from 'fastify-plugin';
import knex, { Knex } from 'knex';
import config from '../config/indexConfig';

const createDbConfig = (): Knex.Config => {
  const commonPool = {
    min: 2,
    max: 10,
  };

  switch (config.dbClient) {
    case 'pg':
      return {
        client: 'pg',
        connection: {
          host: config.dbHost,
          user: config.dbUser,
          password: config.dbPassword,
          port: 5432,
          database: config.dbName,
          ssl: {
            rejectUnauthorized: false,
          },
        },
        pool: commonPool,
      };

    case 'mssql':
      return {
        client: 'mssql',
        connection: {
          server: config.dbHost,
          user: config.dbUser,
          password: config.dbPassword,
          port: 1433,
          database: config.dbName,
          options: {
            encrypt: true,
            trustServerCertificate: false,
          },
        },
        pool: commonPool,
        useNullAsDefault: true,
      };

      case 'mysql':
      return {
        client: 'mysql',
        connection: {
          host: config.dbHost,
          port: 3306,
          user: config.dbUser,
          password: config.dbPassword,
          database: config.dbName,
        },
        pool: commonPool,
        useNullAsDefault: true,
      };

    default:
      throw new Error(`Unsupported DB client: ${config.dbClient}`);
  }
};

export default fp(async (fastify) => {
  const db: Knex = knex(createDbConfig());
  fastify.decorate('db', db);
});
