import 'fastify'
import { Knex } from 'knex'

declare module 'fastify' {
  interface FastifyInstance {
    db: Knex
  }
  interface FastifyRequest {
    permission: 'read' | 'write' | 'full' | null
  }
}