import fp from 'fastify-plugin'
import config from '../config/indexConfig.ts'

type Permission = 'read' | 'write' | 'full'

function getKeyPermission(key: string | undefined): Permission | null {
  if (key === config.apiKeys.full) return 'full'
  if (key === config.apiKeys.write) return 'write'
  if (key === config.apiKeys.read) return 'read'
  return null
}

export default fp(async (fastify) => {
  fastify.decorateRequest('permission', null as Permission | null)

  fastify.addHook('onRequest', async (request, reply) => {
    const apiKey = request.headers['x-api-key'] as string | undefined
    const permission = getKeyPermission(apiKey)

    if (!permission) {
      return reply.code(401).send({ error: 'Unauthorized: Invalid or missing API key' })
    }

    request.permission = permission
  })
})