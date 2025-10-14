import fp from 'fastify-plugin'
import { Permission } from '../../types/permissionType.ts'
import { getKeyPermission } from '../../utils/keyPermissionFilter.ts'



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